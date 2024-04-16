// models/invoice.js
const mongoose = require("mongoose");

const jobCardSchema = new mongoose.Schema(
  {
    jobCardEntries: [
      {
        description: { type: String },
        height: Number,
        width: Number,
        sizeUnit: { type: String, default: "mm" },
        quantity: { type: Number },
        machineNumber: { type: String, default: "CNC1" },
        timeOfWork: Number,
        image: String,
        refImage: String,
        remark: String,
      },
    ],
    status: { type: String, default: "unpaid" },
    closedOn: Date,
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
  },
  {
    timestamps: true,
  }
);

const transactionSchema = new mongoose.Schema(
  {
    customerInfoId: String,
    contractorInfoId: String,
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
    jobCards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "JobCard",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const masterSchema = new mongoose.Schema({
  customerInfo: [
    {
      name: String,
      phone: String,
      _id: String,
    },
  ],
  contractorInfo: [
    {
      name: String,
      phone: String,
      _id: String,
    },
  ],
  materials: { type: [String] },
  cncMachines: { type: [String] },
  thickness: { type: [Number] },
  typeOfWork: { type: [String] },
  pricePerHour: Number,
  pricePerSqFeet: Number,
});

const invoiceSchema = new mongoose.Schema(
  {
    costType: String,
    unitPrice: { type: [Number] },
    status: { type: String, default: "unpaid" },
    jobCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCard",
    },
    paymentAmount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const JobCard = mongoose.model("JobCard", jobCardSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);
const Master = mongoose.model("Master", masterSchema);
const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = {
  Transaction,
  JobCard,
  Master,
  Invoice,
};
