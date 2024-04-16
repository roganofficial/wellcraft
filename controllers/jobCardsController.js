// controllers/jobCardsController.js
const { Transaction, JobCard } = require("../models/invoice");
const multer = require("multer");

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/"); // Adjust the destination as needed
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  },
});

const upload = multer({ storage: storage });
// Add Job Card & Update Invoice
exports.addJobCard = async (req, res) => {
  try {
    // Process the image upload

    await upload.fields([
      { name: "image", maxCount: 1 },
      { name: "refImage", maxCount: 1 },
    ])(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      const transaction = await Transaction.findById(
        req.body.transactionId
      ).populate("jobCards");
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      // Create the new JobCard (after potential image upload)
      if (transaction.jobCards.length > 0) {
        const unpaidJobCard = transaction.jobCards.find(
          (jobCard) => jobCard.status === "unpaid"
        );
        const updateBody = {
          jobCardEntries: [
            ...unpaidJobCard.jobCardEntries,
            {
              ...req.body,
              image: req.files["image"]
                ? req.files["image"][0].path
                : undefined,
              refImage: req.files["refImage"]
                ? req.files["refImage"][0].path
                : undefined,
            },
          ],
        };
        console.log(updateBody);
        const updatedJobCard = await JobCard.findByIdAndUpdate(
          unpaidJobCard._id,
          updateBody,
          { new: true }
        );
        if (!updatedJobCard) {
          res.status(500).json({ message: "Job Card update failed" });
        }
        res.status(201).json(updatedJobCard);
      } else {
        const newJobCard = new JobCard({
          jobCardEntries: [
            {
              ...req.body, // Spread the properties from req.body
              image: req.files["image"]
                ? req.files["image"][0].path
                : undefined, // Path for the first image
              refImage: req.files["refImage"]
                ? req.files["refImage"][0].path
                : undefined, // Path for the second image
            },
          ],
        });

        const savedJobCard = await newJobCard.save();
        // Update the corresponding invoice

        transaction.jobCards.push(savedJobCard._id);
        await transaction.save();

        res.status(201).json(savedJobCard);
      }
      // ... Continue with saving the newJobCard and updating the invoice ...
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log(err);
  }
};

// Get All Job Cards (For a simplified API)
exports.getAllJobCards = async (req, res) => {
  try {
    const transactionId = req.query.transactionId;
    const transaction = await Transaction.findById(transactionId).populate(
      "jobCards"
    );
    // const jobCard = transaction.jobCards.find(
    //   (jobCard) => jobCard.status === "unpaid"
    // );
    res.json(transaction.jobCards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobCardsByInvoiceId = async (req, res) => {
  try {
    const invoiceId = req.query.invoiceId;
    const invoice = await Transaction.findById(invoiceId).populate("jobCards");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice.jobCards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteJobCard = async (req, res) => {
  try {
    const jobCardEntryId = req.query.jobCardEntryId;
    const jobCardId = req.query.jobCardId;
    const jobCard = await JobCard.findById(jobCardId);

    const updatedJobCard = await JobCard.findByIdAndUpdate(
      jobCardId,
      {
        jobCardEntries: jobCard.jobCardEntries.filter(
          (e) => e._id.toString() !== jobCardEntryId
        ),
      },
      { new: true }
    );
    if (!updatedJobCard) {
      return res.status(404).json({ message: "Job Card not found" });
    }
    res.json(updatedJobCard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateJobCardEntries = async (req, res) => {
  try {
    const jobCardId = req.query.jobCardId;
    const jobCard = await JobCard.findByIdAndUpdate(
      jobCardId,
      { jobCardEntries: req.body },
      { new: true }
    );
    if (!jobCard) {
      return res.status(404).json({ message: "Job Card not found" });
    }
    res.json(jobCard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobCardById = async (req, res) => {
  try {
    const jobCardId = req.query.jobCardId;
    const jobCard = await JobCard.findById(jobCardId);
    if (!jobCard) {
      return res.status(404).json({ message: "Job Card not found" });
    }
    res.json(jobCard);
  } catch (err) {}
};

exports.addEmptyJobCard = async (req, res) => {
  try {
    const transactionId = req.query.transactionId;
    const jobCard = new JobCard();
    const savedJobCard = await jobCard.save();
    if (!savedJobCard) {
      return res.status(404).json({ message: "Job Card not saved" });
    }
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { $push: { jobCards: savedJobCard._id } },
      { new: true }
    );
    res.json(updatedTransaction);
  } catch (err) {}
};
