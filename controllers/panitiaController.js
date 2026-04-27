const { Panitia } = require("../models");
const HttpCode = require("./http-code/httpCode");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class PanitiaController {
  async createPanitia(req, res) {
    const { nama, password } = req.body;

    try {
      if (!nama || !password) {
        return HttpCode.send(res, 400, {
          message: "Data panitia wajib diisi",
        });
      }

      const checkName = await Panitia.findOne({
        where: {
          nama: nama,
        },
      });

      if (checkName != null) {
        return HttpCode.send(res, 400, {
          message: "Nama sudah digunakan",
        });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const create = await Panitia.create({
        nama: nama,
        password: password_hash,
      });

      return HttpCode.send(res, 201, {
        message: "Akun panitia berhasil dibuat",
      });
    } catch (err) {
      return HttpCode.send(res, 500, {
        message: `${err}`,
      });
    }
  }

  async getPanitia(req, res) {
    try {
      const data = await Panitia.findAll({
        attributes: ["nama", "password"],
      });

      return HttpCode.send(res, 200, {
        message: "Berhasil mengambil data",
        data: data,
      });
    } catch (err) {
      return HttpCode.send(res, 500, {
        message: `${err}`,
      });
    }
  }

  async loginPanitia(req, res) {
    const { nama, password } = req.body;

    try {
      if (!nama || !password) {
        return HttpCode.send(res, 400, {
          message: "Nama atau password wajib diisi",
        });
      }

      const data = await Panitia.findOne({
        where: {
          nama: nama,
        },
      });

      if (data === null) {
        return HttpCode.send(res, 400, {
          message: "Nama atau Password salah",
        });
      }

      const payload = {
        id: data.id,
        nama_panitia: data.nama,
        password: data.password,
        role: "panitia",
      };
      const secretKey = process.env.JWT_SECRET;
      const token = jwt.sign(payload, secretKey, { expiresIn: "1d" });

      const compare = await bcrypt.compare(password, data.password);

      if (compare === true) {
        return HttpCode.send(res, 200, {
          message: "Login berhasil",
          data: token,
        });
      } else {
        return HttpCode.send(res, 400, {
          message: "Nama atau Password salah",
        });
      }
    } catch (err) {
      return HttpCode.send(res, 500, {
        message: `${err}`,
      });
    }
  }

  async updatePanitia(req, res) {
    const { id, nama, password_baru, password_lama } = req.body;

    try {
      if (!id) {
        return HttpCode.send(res, 400, {
          message: "Id panitia tidak boleh kosong",
        });
      }

      const panitia = await Panitia.findByPk(id);
      if (!panitia) {
        return HttpCode.send(res, 404, {
          message: "Data panitia tidak ditemukan",
        });
      }

      let dataUpdate = {};

      if (nama) {
        if (nama !== panitia.nama) {
          const checkName = await Panitia.findOne({ where: { nama: nama } });
          if (checkName) {
            return HttpCode.send(res, 400, {
              message: "Nama sudah digunakan oleh panitia lain",
            });
          }
        }
        dataUpdate.nama = nama;
      }

      if (password_baru) {
        if (!password_lama) {
          return HttpCode.send(res, 400, {
            message: "Password lama wajib diisi untuk mengubah password",
          });
        }

        const isMatch = await bcrypt.compare(password_lama, panitia.password);
        if (!isMatch) {
          return HttpCode.send(res, 401, { message: "Password lama salah" });
        }

        dataUpdate.password = await bcrypt.hash(password_baru, 10);
      }

      if (Object.keys(dataUpdate).length === 0) {
        return HttpCode.send(res, 400, {
          message: "Tidak ada data yang dikirim untuk diupdate",
        });
      }

      await Panitia.update(dataUpdate, {
        where: { id: id },
      });

      return HttpCode.send(res, 200, {
        message: "Akun panitia berhasil diperbarui",
      });
    } catch (err) {
      return HttpCode.send(res, 500, {
        message: err.message || "Terjadi kesalahan pada server",
      });
    }
  }
}

module.exports = new PanitiaController();
