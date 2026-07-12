const bcrypt = require("bcrypt");
const { Kandidat, LogVote, sequelize } = require("../models");
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
    const { username, nomor_urut, nama_kandidat, password, visi, misi } =
      req.body;
    const image_kandidat = req.file ? req.file.path : null;

    try {
      if (
        !username ||
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

      let misiData = "";
      if (misi) {
        if (Array.isArray(misi)) {
          misiData = JSON.stringify(misi);
        } else if (typeof misi === "string" && misi.includes(" || ")) {
          const misiArray = misi
            .split(" || ")
            .filter((item) => item.trim() !== "");
          misiData = JSON.stringify(misiArray);
        } else if (typeof misi === "string" && misi.includes("\n")) {
          misiData = JSON.stringify(
            misi.split("\n").filter((item) => item.trim() !== ""),
          );
        } else {
          misiData = JSON.stringify([misi]);
        }
      } else {
        misiData = JSON.stringify([]);
      }

      const checkDb = await Kandidat.findOne({
        where: {
          [Op.or]: [{ nomor_urut }, { nama_kandidat }, { username }],
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
        username,
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

      console.error("LOG DETAIL:", err);
      return HttpCode.send(res, 500, {
        message: `Terjadi kesalahan pada sistem.`,
      });
    }
  }

  async getAllKandidat(req, res) {
    try {
      const data = await Kandidat.findAll({
        attributes: [
          "id",
          "nomor_urut",
          "nama_kandidat",
          "username",
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
      console.error("LOG DETAIL:", err);
      return HttpCode.send(res, 500, {
        message: `Terjadi kesalahan pada sistem.`,
      });
    }
  }

  async getKandidatById(req, res) {
    const { id } = req.dataUser;

    try {
      const data = await Kandidat.findOne({
        where: { id: id },
        attributes: ["nama_kandidat", "image_kandidat", "visi", "misi"],
      });

      return HttpCode.send(res, 200, {
        message: "Berhasil mengambil data",
        data: data,
      });
    } catch (err) {
      console.error("LOG DETAIL:", err);
      return HttpCode.send(res, 500, {
        message: `Terjadi kesalahan pada sistem.`,
      });
    }
  }

  async updateKandidat(req, res) {
    const {
      username,
      nama_kandidat,
      password_baru,
      password_lama,
      nomor_urut,
      visi,
      misi,
    } = req.body;
    const { id, role } = req.dataUser;

    const new_image_url = req.file ? req.file.path : null;
    const new_image_public_id = req.file ? req.file.filename : null;

    try {
      if (!id) {
        if (new_image_public_id)
          await cloudinary.uploader.destroy(new_image_public_id);
        return HttpCode.send(res, 400, { message: "Id tidak boleh kosong" });
      }

      const kandidat = await Kandidat.findByPk(id);
      if (!kandidat) {
        if (new_image_public_id)
          await cloudinary.uploader.destroy(new_image_public_id);
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
        let misiArray = [];

        if (Array.isArray(misi)) {
          misiArray = misi.map((m) => m.trim()).filter(Boolean);
        } else if (typeof misi === "string") {
          if (misi.includes("||")) {
            misiArray = misi
              .split("||")
              .map((m) => m.trim())
              .filter(Boolean);
          } else if (misi.includes("---")) {
            misiArray = misi
              .split("---")
              .map((m) => m.trim())
              .filter(Boolean);
          } else if (misi.includes("\n")) {
            misiArray = misi
              .split("\n")
              .map((m) => m.trim())
              .filter(Boolean);
          } else if (misi.trim()) {
            misiArray = [misi.trim()];
          }
        }
        dataUpdate.misi = misiArray.join(" || ");
      }

      if (new_image_url) {
        if (kandidat.image_kandidat) {
          const oldPublicId = kandidat.image_kandidat
            .split("/")
            .pop()
            .split(".")[0];
          await cloudinary.uploader
            .destroy(oldPublicId)
            .catch((err) => console.log("Old image delete failed:", err));
        }
        dataUpdate.image_kandidat = new_image_url;
      }

      if (username) {
        dataUpdate.username = username;
      }

      if (password_baru) {
        if (role === "panitia") {
          dataUpdate.password = await bcrypt.hash(password_baru, 10);
        }
        if (role !== "panitia" && !password_lama) {
          if (new_image_public_id)
            await cloudinary.uploader.destroy(new_image_public_id);
          return HttpCode.send(res, 400, {
            message: "Password lama harus diisi",
          });
        }

        if (role !== "panitia") {
          const isMatch = await bcrypt.compare(
            password_lama,
            kandidat.password,
          );
          if (!isMatch) {
            if (new_image_public_id)
              await cloudinary.uploader.destroy(new_image_public_id);
            return HttpCode.send(res, 401, { message: "Password lama salah" });
          }

          dataUpdate.password = await bcrypt.hash(password_baru, 10);
        }
      }

      if (Object.keys(dataUpdate).length === 0) {
        if (new_image_public_id)
          await cloudinary.uploader.destroy(new_image_public_id);
        return HttpCode.send(res, 400, {
          message: "Tidak ada data yang diubah",
        });
      }

      await Kandidat.update(dataUpdate, { where: { id: id } });

      return HttpCode.send(res, 200, {
        message: "Berhasil memperbarui data kandidat",
      });
    } catch (err) {
      if (new_image_public_id) {
        await cloudinary.uploader.destroy(new_image_public_id);
      }

      console.error("LOG DETAIL:", err);
      return HttpCode.send(res, 500, {
        message: `Terjadi kesalahan pada sistem.`,
      });
    }
  }

  async loginKandidat(req, res) {
    const { username, password } = req.body;

    try {
      if (!username || !password) {
        return HttpCode.send(res, 400, {
          message: "Username atau password wajib diisi",
        });
      }

      const data = await Kandidat.findOne({
        where: {
          username: username,
        },
      });

      if (data === null) {
        return HttpCode.send(res, 400, {
          message: "Username atau Password salah",
        });
      }

      const payload = {
        id: data.id,
        username: data.username,
        password: data.password,
        visi: data.visi,
        misi: data.misi,
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
          message: "Username atau Password salah",
        });
      }
    } catch (err) {
      console.error("LOG DETAIL:", err);
      return HttpCode.send(res, 500, {
        message: `Terjadi kesalahan pada sistem.`,
      });
    }
  }

  async deleteKandidatById(req, res) {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
      if (isNaN(id)) {
        await transaction.rollback();
        return HttpCode.send(res, 400, {
          message: "Id tidak valid",
        });
      }

      const idCheck = await Kandidat.findOne({
        where: {
          id: id,
        },
        transaction,
      });

      if (idCheck == null) {
        await transaction.rollback();
        return HttpCode.send(res, 404, {
          message: "Kandidat tidak ditemukan",
        });
      }

      const deletedVotes = await LogVote.destroy({
        where: {
          id_Kandidats: id,
        },
        transaction,
      });

      await Kandidat.destroy({
        where: {
          id: id,
        },
        transaction,
      });

      await transaction.commit();

      return HttpCode.send(res, 200, {
        message: `Berhasil menghapus data kandidat ${idCheck.nama_kandidat}`,
        data: {
          id: idCheck.id,
          nama_kandidat: idCheck.nama_kandidat,
          deletedVotes: deletedVotes,
        },
      });
    } catch (err) {
      await transaction.rollback();
      console.error("LOG DETAIL:", err);

      if (
        err.name === "SequelizeForeignKeyConstraintError" ||
        err.parent?.code === "23503"
      ) {
        return HttpCode.send(res, 409, {
          message:
            "Kandidat tidak dapat dihapus karena masih memiliki data terkait.",
          code: "FOREIGN_KEY_CONSTRAINT",
          detail:
            err.parent?.detail ||
            "Kandidat ini masih terhubung dengan data lain",
        });
      }

      return HttpCode.send(res, 500, {
        message: "Terjadi kesalahan pada sistem. Silakan coba lagi nanti.",
      });
    }
  }
}

module.exports = new KandidatController();
