const router = require("express").Router();
const panitiaController = require("../controllers/panitiaController");
const Auth = require("../middlewares/auth");
const ApiKey = require("../middlewares/apiKey");
const isMaintenance = require("../middlewares/isMaintenance");

// APIKEY
router.use(ApiKey.keyAccess);

// GET
router.get("/data", Auth.roleAccess("panitia"), panitiaController.getPanitia);

// POST
router.post(
  "/generate",
  Auth.roleAccess("panitia"),
  panitiaController.createPanitia,
);
router.post("/login", panitiaController.loginPanitia);

// PATCH
router.patch(
  "/data",
  Auth.roleAccess("panitia"),
  panitiaController.updatePanitia,
);

module.exports = router;
