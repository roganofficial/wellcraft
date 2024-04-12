// routes/invoicesRoutes.js
const express = require("express");
const router = express.Router();
const {
  addTransaction,
  getTransactionById,
  getAllTransactions,
  addInvoice,
} = require("../controllers/invoiceController");
bodyParser = require("body-parser").json();

router.post("/new", bodyParser, addTransaction);
router.get("/", getAllTransactions);
// router.put("/payment", bodyParser, updatePaymentStatus);
router.get("/one", getTransactionById);

router.post("/invoice/new", bodyParser, addInvoice);

module.exports = router;
