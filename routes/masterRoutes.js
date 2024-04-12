const express = require("express");
const router = express.Router();
const masterController = require("../controllers/masterController");
bodyParser = require("body-parser").json();

// Create Master
router.post("/", bodyParser, masterController.createMaster);

// Update Master (by ID)
router.put("/:masterId", bodyParser, masterController.updateMaster);
router.get("/", masterController.getFirstMaster);

// You might also want these, depending on your needs:
// Get all Masters: router.get('/', ...)
// Get one Master by ID: router.get('/:masterId', ...)
// Delete a Master: router.delete('/:masterId', ...)

module.exports = router;
