// controllers/invoicesController.js
const { Transaction, Invoice, JobCard } = require("../models/invoice");

exports.addTransaction = async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);

    const savedTransaction = await newTransaction.save();
    const newJobCard = new JobCard();
    const savedJobCard = await newJobCard.save();
    res.status(201).json(savedTransaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// exports.updatePaymentStatus = async (req, res) => {
//   try {
//     const transactionId = req.query.transactionId;
//     const transaction = await Transaction.findById(transactionId);
//     if (!transaction) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }
//     transaction.paymentStatus = req.body.paymentStatus;
//     await transaction.save();
//     res.status(200).json(transaction);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.getTransactionById = async (req, res) => {
  try {
    const transactionId = req.query.transactionId;
    const transaction = await Transaction.findById(transactionId).populate(
      "jobCards"
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addInvoice = async (req, res) => {
  try {
    const transactionId = req.query.transactionId;
    const transaction = await Transaction.findById(transactionId).populate(
      "jobCards"
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    const openJobCardId = transaction.jobCards.find(
      (jobCard) => jobCard.status === "unpaid"
    )._id;

    const invoice = new Invoice({ ...req.body, jobCardId: openJobCardId });
    const savedInvoice = await invoice.save();
    const updatedJobCard = await JobCard.findByIdAndUpdate(
      openJobCardId,
      {
        status: "closed",
        closedOn: Date.now(),
        invoiceId: savedInvoice._id,
      },
      {
        new: true,
      }
    );

    const newJobCard = new JobCard();
    await newJobCard.save();

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        invoiceId: savedInvoice._id,
        jobCards: [...transaction.jobCards, newJobCard._id],
      },
      { new: true }
    );

    res.json(updatedTransaction);
  } catch (err) {}
};
