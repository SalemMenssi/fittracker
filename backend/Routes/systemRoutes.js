const express = require("express");
const { protect } = require("../Middlewares/authMiddleware");
const { askSystem } = require("../Controllers/systemController");

const router = express.Router();

router.post("/ask", protect, askSystem);

module.exports = router;
