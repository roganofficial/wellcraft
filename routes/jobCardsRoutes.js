// routes/jobCardsRoutes.js
const express = require("express");
const router = express.Router();
const {
  addJobCard,
  getAllJobCards,
  getJobCardsByInvoiceId,
  deleteJobCard,
  updateJobCardEntries,
  getJobCardById,
} = require("../controllers/jobCardsController");
bodyParser = require("body-parser").json();

router.post("/", bodyParser, addJobCard);
router.get("/", getAllJobCards);
router.put("/", deleteJobCard);
router.get("/invoice", bodyParser, getJobCardsByInvoiceId);
router.put("/update", updateJobCardEntries);
router.get("/one", getJobCardById);

module.exports = router;
