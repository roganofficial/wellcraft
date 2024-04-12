const { Master } = require("../models/invoice"); // Assuming your Mongoose model is called 'Master'

exports.createMaster = async (req, res) => {
  try {
    const newMaster = new Master(req.body);
    console.log(req.body);
    const savedMaster = await newMaster.save();
    res.status(201).json(savedMaster);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMaster = async (req, res) => {
  try {
    const updatedMaster = await Master.findByIdAndUpdate(
      req.params.masterId,
      req.body,
      { new: true } // Return the updated document
    );

    if (!updatedMaster) {
      return res.status(404).json({ message: "Master record not found" });
    }

    res.json(updatedMaster);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFirstMaster = async (req, res) => {
  try {
    const firstMaster = await Master.findOne();
    if (!firstMaster) {
      return res.status(404).json({ message: "No master found" });
    }
    res.json(firstMaster);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
