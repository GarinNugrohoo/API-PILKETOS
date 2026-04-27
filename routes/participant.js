const router = require("express").Router();
const participantController = require("../controllers/participantController");
const voteController = require("../controllers/voteController");
const Auth = require("../middlewares/auth");
const ApiKey = require("../middlewares/apiKey");

// APIKEY
router.use(ApiKey.keyAccess);

// GET
router.get(
  "/data",
  Auth.roleAccess("panitia"),
  participantController.getAllPeserta,
);

// POST
router.post(
  "/generate",
  Auth.roleAccess("panitia"),
  participantController.createPeserta,
);
router.post(
  "/generate/kartu",
  Auth.roleAccess("panitia"),
  participantController.createKartuPeserta,
);
router.post("/login", participantController.loginPeserta);
router.post("/vote", Auth.roleAccess("peserta"), voteController.voting);

// DELETE
router.delete(
  "/all",
  Auth.roleAccess("panitia"),
  participantController.deleteAllPeserta,
);

module.exports = router;
