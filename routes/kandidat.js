const router = require("express").Router();
const kandidatController = require("../controllers/kandidatController");
const upload = require("../middlewares/upload");
const Auth = require("../middlewares/auth");
const ApiKey = require("../middlewares/apiKey");
const isMaintenance = require("../middlewares/isMaintenance");

// APIKEY
router.use(ApiKey.keyAccess);

// GET
router.get(
  "/data",
  Auth.roleAccess(["peserta", "panitia", "kandidat"]),
  isMaintenance.activeMaintenance,
  kandidatController.getAllKandidat,
);

// POST
router.post(
  "/generate",
  Auth.roleAccess("panitia"),
  isMaintenance.activeMaintenance,
  upload.single("image_kandidat"),
  kandidatController.createKandidat,
);
router.post("/login", kandidatController.loginKandidat);

// PATCH
router.patch(
  "/data",
  Auth.roleAccess(["panitia", "kandidat"]),
  isMaintenance.activeMaintenance,
  kandidatController.updateKandidat,
);

// DELETE
router.delete(
  "/:id",
  Auth.roleAccess("panitia"),
  isMaintenance.activeMaintenance,
  kandidatController.deleteKandidatById,
);

module.exports = router;
