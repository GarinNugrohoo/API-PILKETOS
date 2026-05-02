const pdf = require("pdfkit");
const fs = require("fs");
const path = require("path");
const HttpCode = require("./http-code/httpCode");
const jwt = require("jsonwebtoken");
const { Participant } = require("../models");
const { Sequelize } = require("sequelize");
const kandidatController = require("./kandidatController");

class ParticipantController {
  async createPeserta(req, res) {
    const { kelas, jumlah_siswa } = req.body;
    const limit = 2000;
    var results = [];

    try {
      if (!kelas && !jumlah_siswa) {
        return HttpCode.send(res, 400, {
          message: "Data kelas atau jumlah siswa tidak boleh kosong",
        });
      } else if (kelas != "X" && kelas != "XI" && kelas != "XII") {
        return HttpCode.send(res, 400, {
          message: "Data kelas tidak valid",
        });
      } else if (jumlah_siswa > limit) {
        return HttpCode.send(res, 429, {
          message: "Terlalu banyak request",
        });
      }

      if (kelas == "X") {
        for (var i = 0; i < jumlah_siswa; i++) {
          const kodeAwal = Math.floor(Math.random() * 1000000000);
          const hasil = kodeAwal.toString().padStart(9, "671257318273817290");

          results.push({
            kelas: kelas,
            kode_peserta: "X" + hasil,
          });
        }

        const data = await Participant.bulkCreate(results);
        return HttpCode.send(res, 201, {
          message: "Berhasil membuat kode peserta kelas X",
          countData: jumlah_siswa,
        });
      }

      if (kelas == "XI") {
        for (var i = 0; i < jumlah_siswa; i++) {
          const kodeAwal = Math.floor(Math.random() * 100000000);
          const hasil = kodeAwal
            .toString()
            .padStart(8, "67125737561525018273817290");

          results.push({
            kelas: kelas,
            kode_peserta: "XI" + hasil,
          });
        }

        const data = await Participant.bulkCreate(results);
        return HttpCode.send(res, 201, {
          message: "Berhasil membuat kode peserta kelas XI",
          countData: jumlah_siswa,
        });

        return res.status(200).json;
      }

      if (kelas == "XII") {
        for (var i = 0; i < jumlah_siswa; i++) {
          const kodeAwal = Math.floor(Math.random() * 10000000);
          const hasil = kodeAwal
            .toString()
            .padStart(7, "67125737561525018273817290");

          results.push({
            kelas: kelas,
            kode_peserta: "XII" + hasil,
          });
        }

        const data = await Participant.bulkCreate(results);

        return HttpCode.send(res, 201, {
          message: "Berhasil membuat kode peserta kelas XII",
          countData: jumlah_siswa,
        });
      }
    } catch (err) {
      console.error("LOG DETAIL:", err);
      return HttpCode.send(res, 500, {
        message: `Terjadi kesalahan pada sistem.`,
      });
    }
  }

  async getAllPeserta(req, res) {
    try {
      const data = await Participant.findAll({
        attributes: ["id", "kode_peserta", "kelas", "memilih"],
      });

      if (data.length != 0) {
        return HttpCode.send(res, 200, {
          message: "Berhasil mengambil data",
          data: data,
        });
      } else {
        return HttpCode.send(res, 404, {
          message: "Data tidak ditemukan",
        });
      }
    } catch (err) {
      console.error("LOG DETAIL:", err);
      return HttpCode.send(res, 500, {
        message: `Terjadi kesalahan pada sistem.`,
      });
    }
  }

  async deleteAllPeserta(req, res) {
    try {
      const data = await Participant.destroy({
        truncate: true,
        cascade: false,
      });

      return HttpCode.send(res, 200, {
        message: "Berhasil menghapus data",
      });
    } catch (err) {
      console.error("LOG DETAIL:", err);
      return HttpCode.send(res, 500, {
        message: `Terjadi kesalahan pada sistem.`,
      });
    }
  }

  async resetPesertaStatus(req, res) {
    const { status, kode_peserta, kode_reset } = req.body;

    try {
      if (!status || !kode_peserta || !kode_reset) {
        return HttpCode.send(res, 400, {
          message: "Status, kode reset, atau kode peserta tidak valid",
        });
      }

      if (kode_reset !== process.env.KODE_RESET) {
        return HttpCode.send(res, 400, {
          message: "Status, kode reset, atau kode peserta tidak valid",
        });
      }

      if (status === false) {
        return HttpCode.send(res, 400, { message: "Invalid status" });
      }

      const data = await Participant.findOne({
        where: { kode_peserta: kode_peserta },
      });

      if (data === null) {
        return HttpCode.send(res, 404, { message: "Data tidak ditemukan" });
      } else if (data.memilih === false) {
        return HttpCode.send(res, 400, { message: "Invalid status" });
      } else if (data.memilih === true) {
        const updateData = await Participant.update(
          { memilih: false },
          { where: { kode_peserta: kode_peserta } },
        );
        return HttpCode.send(res, 200, { message: "Data berhasil di reset" });
      }
    } catch (err) {
      console.error("LOG DETAIL:", err);
      return HttpCode.send(res, 500, {
        message: `Terjadi kesalahan pada sistem.`,
      });
    }
  }

  async createKartuPeserta(req, res) {
    try {
      const { kelas } = req.body;

      if (kelas === "ALL") {
        const dataAll = await Participant.findAll({
          attributes: ["kode_peserta", "kelas"],
          order: [
            Sequelize.literal(`CASE 
      WHEN kelas = 'X' THEN 1 
      WHEN kelas = 'XI' THEN 2 
      WHEN kelas = 'XII' THEN 3 
      ELSE 4 
    END`),
          ],
        });

        if (dataAll.length == 0) {
          return HttpCode.send(res, 404, {
            message: "Data tidak ditemukan",
          });
        }

        const fileName = `kartu_peserta_ALL_${Date.now()}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${fileName}`,
        );

        const document = new pdf();
        document.pipe(res);

        const margin = 28;
        const cardsPerPage = 40;
        const cols = 5;
        const rows = 10;
        const gap = 12;

        const cardWidth = (595 - margin * 2 - gap * (cols - 1)) / cols;
        const cardHeight = (842 - margin * 2 - gap * (rows - 1)) / rows;

        dataAll.forEach((p, index) => {
          if (index > 0 && index % cardsPerPage === 0) {
            document.addPage();
          }

          const indexOnPage = index % cardsPerPage;
          const col = indexOnPage % cols;
          const row = Math.floor(indexOnPage / cols);

          const x = margin + col * (cardWidth + gap);
          const y = margin + row * (cardHeight + gap);

          document
            .undash()
            .lineWidth(1.5)
            .strokeColor("#333333")
            .rect(x, y, cardWidth, cardHeight)
            .stroke();

          document.fillColor("#000000");

          document
            .fontSize(7)
            .font("Helvetica")
            .text(`${index + 1}`, x + 5, y + 5);

          document
            .fontSize(13)
            .font("Courier-Bold")
            .text(p.kode_peserta || "-", x, y + 23, {
              width: cardWidth,
              align: "center",
            });

          document
            .fontSize(8)
            .font("Helvetica")
            .text(`KATEGORI: ${p.kelas || "-"}`, x, y + 43, {
              width: cardWidth,
              align: "center",
            });

          document
            .fontSize(6)
            .fillColor("#666666")
            .text("KODE PESERTA", x, y + 55, {
              width: cardWidth,
              align: "center",
            });
        });

        document.end();
      } else if (kelas == "X" || "XI" || "XII") {
        const data = await Participant.findAll({
          where: { kelas: kelas },
        });

        if (data.length == 0) {
          return HttpCode.send(res, 404, {
            message: "Data tidak ditemukan",
          });
        }

        const fileName = `kartu_peserta_${kelas}_${Date.now()}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${fileName}`,
        );

        const document = new pdf();
        document.pipe(res);

        const margin = 28;
        const cardsPerPage = 40;
        const cols = 5;
        const rows = 10;
        const gap = 12;

        const cardWidth = (595 - margin * 2 - gap * (cols - 1)) / cols;
        const cardHeight = (842 - margin * 2 - gap * (rows - 1)) / rows;

        data.forEach((p, index) => {
          if (index > 0 && index % cardsPerPage === 0) {
            document.addPage();
          }

          const indexOnPage = index % cardsPerPage;
          const col = indexOnPage % cols;
          const row = Math.floor(indexOnPage / cols);

          const x = margin + col * (cardWidth + gap);
          const y = margin + row * (cardHeight + gap);

          document
            .undash()
            .lineWidth(1.5)
            .strokeColor("#333333")
            .rect(x, y, cardWidth, cardHeight)
            .stroke();

          document.fillColor("#000000");

          document
            .fontSize(7)
            .font("Helvetica")
            .text(`${index + 1}`, x + 5, y + 5);

          document
            .fontSize(13)
            .font("Courier-Bold")
            .text(p.kode_peserta || "-", x, y + 23, {
              width: cardWidth,
              align: "center",
            });

          document
            .fontSize(8)
            .font("Helvetica")
            .text(`KATEGORI: ${p.kelas || "-"}`, x, y + 43, {
              width: cardWidth,
              align: "center",
            });

          document
            .fontSize(6)
            .fillColor("#666666")
            .text("KODE PESERTA", x, y + 55, {
              width: cardWidth,
              align: "center",
            });
        });

        document.end();
      }
    } catch (err) {
      console.error("LOG DETAIL:", err);
      return HttpCode.send(res, 500, {
        message: `Terjadi kesalahan pada sistem.`,
      });
    }
  }

  async loginPeserta(req, res) {
    const { kode_peserta } = req.body;

    try {
      if (!kode_peserta) {
        return HttpCode.send(res, 400, {
          message: "Kode wajib diisi",
        });
      }

      if (kode_peserta.length != 10) {
        return HttpCode.send(res, 400, {
          message: "Kode tidak valid",
        });
      }

      if (kode_peserta.charAt(0) != "X" && "XI" && "XII") {
        return HttpCode.send(res, 400, {
          message: "Kode tidak valid",
        });
      }

      const data = await Participant.findOne({
        where: {
          kode_peserta: kode_peserta,
        },
      });

      if (data === null) {
        return HttpCode.send(res, 400, {
          message: "Kode tidak valid",
        });
      } else if (data.memilih === true) {
        return HttpCode.send(res, 403, {
          message: "Kode sudah digunakan",
        });
      } else {
        const payload = {
          id: data.id,
          kode_peserta: data.kode_peserta,
          role: "peserta",
        };
        const secretKey = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

        return HttpCode.send(res, 200, {
          message: "Berhasil login",
          dataLogin: token,
        });
      }
    } catch (err) {
      console.error("LOG DETAIL:", err);
      return HttpCode.send(res, 500, {
        message: `Terjadi kesalahan pada sistem.`,
      });
    }
  }
}

module.exports = new ParticipantController();
