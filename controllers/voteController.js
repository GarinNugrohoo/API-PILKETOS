const HttpCode = require("./http-code/httpCode");
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
}

module.exports = new VoteController();
