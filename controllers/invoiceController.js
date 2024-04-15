// controllers/invoicesController.js
const { Transaction, Invoice, JobCard } = require("../models/invoice");

exports.addTransaction = async (req, res) => {
  try {
    const newJobCard = new JobCard();
    const savedJobCard = await newJobCard.save();
    const newTransaction = new Transaction({
      ...req.body,
      jobCards: [savedJobCard._id],
    });

    const savedTransaction = await newTransaction.save();

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
    const jobCardId = req.query.jobCardId;
    const transactionId = req.query.transactionId;
    const transaction = await Transaction.findById(transactionId).populate(
      "jobCards"
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    const existingInvoice = await Invoice.findOne({ jobCardId: jobCardId });
    if (existingInvoice) {
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        existingInvoice._id,
        {
          ...req.body,
          status: "closed",
          closedOn: Date.now(),
          invoiceId: existingInvoice._id,
        },
        { new: true }
      );
      if (
        transaction.jobCards.filter((jobCard) => jobCard.status === "unpaid")
          .length === 0
      ) {
        const newJobCard = new JobCard();
        await newJobCard.save();
        const updatedNewTransaction = await Transaction.findByIdAndUpdate(
          transactionId,
          {
            jobCards: [...transaction.jobCards, newJobCard._id],
          },
          { new: true }
        );
      }
      return res.json(updatedInvoice);
    } else {
      const invoice = new Invoice({
        ...req.body,
        jobCardId,
      }); // Assuming first job card as a temporary logic
      await invoice.save();

      const updatedTransaction = await Transaction.findByIdAndUpdate(
        transactionId,
        {
          invoiceId: invoice._id,
        },
        { new: true }
      ).populate("jobCards");

      const updatedJobCard = await JobCard.findByIdAndUpdate(
        jobCardId,
        {
          status: "closed",
          closedOn: Date.now(),
          invoiceId: invoice._id,
        },
        { new: true }
      );

      console.log(
        updatedTransaction.jobCards.filter(
          (jobCard) => jobCard.status === "unpaid"
        ).length
      );

      if (
        updatedTransaction.jobCards.filter(
          (jobCard) => jobCard.status === "unpaid"
        ).length === 0
      ) {
        const newJobCard = new JobCard();
        await newJobCard.save();
        const updatedNewTransaction = await Transaction.findByIdAndUpdate(
          transactionId,
          {
            jobCards: [...transaction.jobCards, newJobCard._id],
          },
          { new: true }
        );
      }

      return res.json(updatedTransaction);
    }
  } catch (err) {}
};

exports.fetchInvoice = async (req, res) => {
  try {
    const jobCardId = req.query.jobCardId;
    const invoice = await Invoice.find({ jobCardId });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (err) {}
};

exports.updatePayment = async (req, res) => {
  try {
    const invoiceId = req.query.invoiceId;
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      req.body,
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    return res.json(updatedInvoice);
  } catch (err) {}
};
