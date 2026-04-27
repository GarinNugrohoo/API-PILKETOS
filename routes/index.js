const participant = require("./participant");
const kandidat = require("./kandidat");
const panitia = require("./panitia");
const router = require("express").Router();

// ROUTE API
router.use("/api/peserta", participant);
router.use("/api/kandidat", kandidat);
router.use("/api/panitia", panitia);

module.exports = router;
