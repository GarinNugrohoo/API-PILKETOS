const router = require("express").Router();
const participantController = require("../controllers/participantController");
const voteController = require("../controllers/voteController");
const Auth = require("../middlewares/auth");
const ApiKey = require("../middlewares/apiKey");
const isMaintenance = require("../middlewares/isMaintenance");

// APIKEY
router.use(ApiKey.keyAccess);

// GET
router.get(
  "/data",
  Auth.roleAccess("panitia"),
  isMaintenance.activeMaintenance,
  participantController.getAllPeserta,
);

// POST
router.post(
  "/generate",
  Auth.roleAccess("panitia"),
  isMaintenance.activeMaintenance,
  participantController.createPeserta,
);
router.post(
  "/generate/kartu",
  Auth.roleAccess("panitia"),
  isMaintenance.activeMaintenance,
  participantController.createKartuPeserta,
);
router.post("/login", participantController.loginPeserta);
router.post(
  "/vote",
  Auth.roleAccess("peserta"),
  isMaintenance.activeMaintenance,
  voteController.voting,
);

// PATCH
router.patch(
  "/reset/status",
  Auth.roleAccess("panitia"),
  isMaintenance.activeMaintenance,
  participantController.resetPesertaStatus,
);

// DELETE
router.delete(
  "/all",
  Auth.roleAccess("panitia"),
  isMaintenance.activeMaintenance,
  participantController.deleteAllPeserta,
);

module.exports = router;
