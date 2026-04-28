const HttpCode = require("./http-code/httpCode");
const pdf = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { Kandidat, Participant } = require("../models");

class VoteController {
  async voting(req, res) {
    const { kode_peserta, nomor_urut } = req.body;

    try {
      if (!kode_peserta || !nomor_urut) {
        return HttpCode.send(res, 400, {
          message: "Data voting wajib diisi",
        });
      }

      const dataKandidat = await Kandidat.findOne({
        where: {
          nomor_urut: nomor_urut,
        },
      });

      const dataPeserta = await Participant.findOne({
        where: {
          kode_peserta: kode_peserta,
        },
      });

      if (dataKandidat === null) {
        return HttpCode.send(res, 400, {
          message: "Nomor urut tidak terdaftar",
        });
      } else if (dataPeserta === null) {
        return HttpCode.send(res, 400, {
          message: "Kode peserta tidak valid",
        });
      } else if (dataPeserta.memilih === true) {
        return HttpCode.send(res, 403, {
          message: "Kode sudah digunakan untuk memilih",
        });
      }

      const vote = await Kandidat.increment(
        {
          pemilih: 1,
        },
        {
          where: {
            id: dataKandidat.id,
          },
        },
      );

      const isVote = await Participant.update(
        {
          memilih: true,
        },
        {
          where: {
            id: dataPeserta.id,
          },
        },
      );

      return HttpCode.send(res, 200, {
        message: "Voting sukses",
      });
    } catch (err) {
      return HttpCode.send(res, 500, {
        message: `${err}`,
      });
    }
  }

  async createPemenang(req, res) {
    try {
      const votingMode = process.env.E_VOTING_MODE || "1";
      const tahunLaksana =
        process.env.TAHUN_PELAKSANAAN || new Date().getFullYear().toString();
      const masaBakti = `${tahunLaksana}/${parseInt(tahunLaksana) + 1}`;

      const data = await Kandidat.findAll({
        attributes: ["nomor_urut", "nama_kandidat", "pemilih"],
        order: [["pemilih", "DESC"]],
      });

      if (data.length == 0) {
        return HttpCode.send(res, 404, { message: "Data tidak ditemukan" });
      }

      const totalSuaraMasuk = data.reduce((acc, curr) => acc + curr.pemilih, 0);

      const document = new pdf({ margin: 50, size: "A4" });
      const folderPath = path.join(__dirname, "../assets/pdf");
      const fileName =
        Math.floor(Math.random() * 1000000000000000) + "_berita_acara.pdf";
      const filePath = path.join(folderPath, fileName);

      document.pipe(fs.createWriteStream(filePath));

      const dirSekolah = path.join(__dirname, "../assets/images/logo_sekolah/");
      const dirOrganisasi = path.join(
        __dirname,
        "../assets/images/logo_organisasi/",
      );

      const getFirstFile = (dirPath) => {
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath);
          return files.length > 0 ? path.join(dirPath, files[0]) : null;
        }
        return null;
      };

      const logoSekolah = getFirstFile(dirSekolah);
      const logoOrganisasi = getFirstFile(dirOrganisasi);

      if (logoSekolah) document.image(logoSekolah, 50, 45, { width: 50 });
      if (logoOrganisasi)
        document.image(logoOrganisasi, 495, 45, { width: 50 });

      document
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("PANITIA PEMILIHAN KETUA OSIS ", { align: "center" });
      document
        .fontSize(12)
        .text(process.env.NAMA_ORGANISASI, { align: "center" });
      document
        .fontSize(11)
        .font("Helvetica")
        .text(`Masa Bakti ${masaBakti}`, { align: "center" });
      document.moveDown(0.5);
      document
        .moveTo(50, document.y)
        .lineTo(545, document.y)
        .lineWidth(2)
        .stroke();
      document.moveDown(2);

      document
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("BERITA ACARA KETETAPAN HASIL PEROLEHAN SUARA", {
          align: "center",
        });
      document
        .moveTo(150, document.y)
        .lineTo(445, document.y)
        .lineWidth(0.5)
        .stroke();
      document.moveDown(1.5);

      const narasi = `Berdasarkan hasil penghitungan suara (Real Count) yang telah dilaksanakan secara serentak pada tahun ${tahunLaksana}, dengan total perolehan ${totalSuaraMasuk} suara sah yang masuk, maka Panitia Pelaksana menetapkan hasil rekapitulasi perolehan suara sebagai berikut:`;
      document
        .font("Helvetica")
        .fontSize(11)
        .text(narasi, { align: "justify", lineGap: 2 });
      document.moveDown(1.5);

      const startX = 50;
      const col = {
        rank: 70,
        noUrut: 70,
        nama: 230,
        suara: 125,
      };

      let currentY = document.y;

      document.fillColor("#2c3e50").rect(startX, currentY, 495, 25).fill();
      document.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);

      document.text("PERINGKAT", startX, currentY + 8, {
        width: col.rank,
        align: "center",
      });
      document.text("NO. URUT", startX + col.rank, currentY + 8, {
        width: col.noUrut,
        align: "center",
      });
      document.text(
        votingMode === "2" ? "PASANGAN KANDIDAT" : "NAMA KANDIDAT",
        startX + col.rank + col.noUrut + 10,
        currentY + 8,
      );
      document.text("TOTAL SUARA", startX + 370, currentY + 8, {
        width: col.suara,
        align: "center",
      });

      currentY += 25;
      document.fillColor("#000000").font("Helvetica").fontSize(10);

      data.forEach((kandidat, index) => {
        const noUrutDisplay =
          kandidat.nomor_urut < 10
            ? `0${kandidat.nomor_urut}`
            : kandidat.nomor_urut;
        const namaKandidat = kandidat.nama_kandidat.toUpperCase();

        const textHeight = document.heightOfString(namaKandidat, {
          width: col.nama,
        });
        const rowHeight = Math.max(25, textHeight + 10);

        if (currentY + rowHeight > 750) {
          document.addPage();
          currentY = 50;
        }

        document.rect(startX, currentY, 495, rowHeight).stroke();

        document.text(
          (index + 1).toString(),
          startX,
          currentY + (rowHeight / 2 - 5),
          { width: col.rank, align: "center" },
        );

        document
          .font("Helvetica-Bold")
          .text(
            noUrutDisplay.toString(),
            startX + col.rank,
            currentY + (rowHeight / 2 - 5),
            { width: col.noUrut, align: "center" },
          )
          .font("Helvetica");

        document.text(
          namaKandidat,
          startX + col.rank + col.noUrut + 10,
          currentY + (rowHeight / 2 - textHeight / 2),
          {
            width: col.nama,
            align: "left",
          },
        );

        document
          .font("Helvetica-Bold")
          .text(
            `${kandidat.pemilih} Suara`,
            startX + 370,
            currentY + (rowHeight / 2 - 5),
            { width: col.suara, align: "center" },
          )
          .font("Helvetica");

        currentY += rowHeight;
      });

      document.moveDown(2);

      const pemenang = data[0];
      const pemenangNoUrut =
        pemenang.nomor_urut < 10
          ? `0${pemenang.nomor_urut}`
          : pemenang.nomor_urut;
      const jabatanText =
        votingMode === "2"
          ? "Ketua dan Wakil Ketua OSIS Terpilih"
          : "Ketua OSIS Terpilih";

      const isiPernyataan = `Menetapkan Saudara/i ${pemenang.nama_kandidat.toUpperCase()} (Nomor Urut ${pemenangNoUrut}) sebagai ${jabatanText} Masa Bakti ${masaBakti} berdasarkan perolehan suara tertinggi secara sah.`;
      const boxHeight =
        document.heightOfString(isiPernyataan, { width: 465 }) + 30;

      document
        .fillColor("#f9f9f9")
        .rect(50, document.y, 495, boxHeight)
        .fill()
        .strokeColor("#000");
      document
        .fillColor("#000")
        .font("Helvetica-Bold")
        .text("KETETAPAN PEMENANG:", 65, document.y + 10);
      document.font("Helvetica").moveDown(0.5);
      document.text(isiPernyataan, 65, document.y, {
        width: 465,
        align: "justify",
      });

      document.moveDown(4);

      const signY = document.y;
      document.fontSize(10);
      document.text("Panitia Pelaksana,", 50, signY);
      document.font("Helvetica-Bold").text("Ketua Pelaksana,", 50, signY + 12);
      document.moveDown(4);
      document.text("( __________________________ )", 50, signY + 75);

      document.font("Helvetica").text("Mengetahui,", 380, signY);
      document
        .font("Helvetica-Bold")
        .text("Penanggung Jawab,", 380, signY + 12);
      document.moveDown(4);
      document.text("( __________________________ )", 380, signY + 75);

      document.end();

      return HttpCode.send(res, 201, {
        message: "Berita Acara Pemenang berhasil diterbitkan",
        data: fileName,
      });
    } catch (err) {
      return HttpCode.send(res, 500, { message: `${err}` });
    }
  }
}

module.exports = new VoteController();
