const router = require("express").Router();
const kandidatController = require("../controllers/kandidatController");
const upload = require("../middlewares/upload");
const Auth = require("../middlewares/auth");
const ApiKey = require("../middlewares/apiKey");

// APIKEY
router.use(ApiKey.keyAccess);

// GET
router.get(
  "/data",
  Auth.roleAccess(["peserta", "panitia", "kandidat"]),
  kandidatController.getAllKandidat,
);

// POST
router.post(
  "/generate",
  Auth.roleAccess("panitia"),
  upload.single("image_kandidat"),
  kandidatController.createKandidat,
);
router.post("/login", kandidatController.loginKandidat);

// PATCH
router.patch(
  "/data",
  Auth.roleAccess(["panitia", "kandidat"]),
  kandidatController.updateKandidat,
);

// DELETE
router.delete(
  "/:id",
  Auth.roleAccess("panitia"),
  kandidatController.deleteKandidatById,
);

module.exports = router;
