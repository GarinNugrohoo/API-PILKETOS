const bcrypt = require("bcrypt");
const { Kandidat } = require("../models");
const { image } = require("pdfkit");
const { where, Op } = require("sequelize");
const HttpCode = require("./http-code/httpCode");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

class KandidatController {
  async createKandidat(req, res) {
    const { nomor_urut, nama_kandidat, password, visi, misi } = req.body;
    const image_kandidat = req.file ? req.file.path : null;

    try {
      if (
        !nomor_urut ||
        !nama_kandidat ||
        !password ||
        !visi ||
        !misi ||
        !image_kandidat
      ) {
        if (req.file) await cloudinary.uploader.destroy(req.file.filename);
        return HttpCode.send(res, 400, {
          message: "Data kandidat wajib diisi lengkap",
        });
      }

      let misiData;
      if (Array.isArray(misi)) {
        misiData = JSON.stringify(misi);
      } else {
        misiData = JSON.stringify(
          misi.split("\n").filter((item) => item.trim() !== ""),
        );
      }

      const checkDb = await Kandidat.findOne({
        where: {
          [Op.or]: [{ nomor_urut }, { nama_kandidat }],
        },
      });

      if (checkDb != null) {
        if (req.file && req.file.filename) {
          await cloudinary.uploader.destroy(req.file.filename);
        }
        return HttpCode.send(res, 400, {
          message: "Nama atau nomor urut sudah terdaftar",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const data = await Kandidat.create({
        nomor_urut,
        nama_kandidat,
        password: passwordHash,
        visi,
        misi: misiData,
        image_kandidat,
      });

      return HttpCode.send(res, 201, {
        message: "Berhasil membuat akun",
        data: data,
      });
    } catch (err) {
      if (req.file && req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return HttpCode.send(res, 500, { message: `${err}` });
    }
  }

  async getAllKandidat(req, res) {
    try {
      const data = await Kandidat.findAll({
        attributes: [
          "id",
          "nomor_urut",
          "nama_kandidat",
          "visi",
          "misi",
          "image_kandidat",
          "pemilih",
        ],
      });

      if (data[0] == undefined) {
        return HttpCode.send(res, 404, {
          message: "Data tidak ditemukan",
        });
      } else if (data[0] != undefined) {
        return HttpCode.send(res, 200, {
          data: data,
        });
      }
    } catch (err) {
      return HttpCode.send(res, 500, {
        message: `${err}`,
      });
    }
  }

  async updateKandidat(req, res) {
    const {
      id,
      nomor_urut,
      nama_kandidat,
      password_baru,
      password_lama,
      visi,
      misi,
    } = req.body;
    const new_image = req.file ? req.file.filename : null;

    try {
      if (!id) {
        if (req.file) fs.unlinkSync(req.file.path);
        return HttpCode.send(res, 400, { message: "Id tidak boleh kosong" });
      }

      const kandidat = await Kandidat.findByPk(id);
      if (!kandidat) {
        if (req.file) fs.unlinkSync(req.file.path);
        return HttpCode.send(res, 404, { message: "Kandidat tidak ditemukan" });
      }

      let dataUpdate = {};
      if (nomor_urut) dataUpdate.nomor_urut = nomor_urut;
      if (nama_kandidat) dataUpdate.nama_kandidat = nama_kandidat;

      if (visi) {
        if (visi.length > 5000)
          return HttpCode.send(res, 400, { message: "Visi max 5000 karakter" });
        dataUpdate.visi = visi;
      }
      if (misi) {
        if (misi.length > 5000)
          return HttpCode.send(res, 400, { message: "Misi max 5000 karakter" });
        dataUpdate.misi = misi;
      }

      if (new_image) {
        if (kandidat.image_kandidat) {
          const oldPath = path.join(
            __dirname,
            "../assets/images/",
            kandidat.image_kandidat,
          );
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        dataUpdate.image_kandidat = new_image;
      }

      if (password_baru) {
        if (!password_lama) {
          if (req.file) fs.unlinkSync(req.file.path);
          return HttpCode.send(res, 400, {
            message: "Password lama harus diisi",
          });
        }

        const isMatch = await bcrypt.compare(password_lama, kandidat.password);
        if (!isMatch) {
          if (req.file) fs.unlinkSync(req.file.path);
          return HttpCode.send(res, 401, { message: "Password lama salah" });
        }

        dataUpdate.password = await bcrypt.hash(password_baru, 10);
      }

      if (Object.keys(dataUpdate).length === 0) {
        return HttpCode.send(res, 400, {
          message: "Tidak ada data yang diubah",
        });
      }

      await Kandidat.update(dataUpdate, { where: { id: id } });

      return HttpCode.send(res, 200, {
        message: "Berhasil memperbarui data kandidat",
      });
    } catch (err) {
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "../assets/images/",
          req.file.filename,
        );
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      return HttpCode.send(res, 500, { message: err.message });
    }
  }

  async loginKandidat(req, res) {
    const { nama_kandidat, password } = req.body;

    try {
      if (!nama_kandidat || !password) {
        return HttpCode.send(res, 400, {
          message: "Nama atau password wajib diisi",
        });
      }

      const data = await Kandidat.findOne({
        where: {
          nama_kandidat: nama_kandidat,
        },
      });

      if (data === null) {
        return HttpCode.send(res, 400, {
          message: "Nama atau Password salah",
        });
      }

      const payload = {
        id: data.id,
        nama_kandidat: data.nama_kandidat,
        password: data.password,
        role: "kandidat",
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

  async deleteKandidatById(req, res) {
    const { id } = req.params;

    try {
      if (isNaN(id)) {
        return HttpCode.send(res, 400, {
          message: "Id tidak valid",
        });
      }

      const idCheck = await Kandidat.findOne({
        where: {
          id: id,
        },
      });

      if (idCheck == null) {
        return HttpCode.send(res, 400, {
          message: "id tidak ditemukan",
        });
      } else if (idCheck != null) {
        await Kandidat.destroy({
          where: {
            id: idCheck.id,
          },
        });

        return HttpCode.send(res, 200, {
          message: "Berhasil menghapus data",
        });
      }
    } catch (err) {
      return HttpCode.send(res, 500, {
        message: `${err}`,
      });
    }
  }
}

module.exports = new KandidatController();
