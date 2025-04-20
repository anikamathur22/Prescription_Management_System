import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Doctor, Prescription } from "./models/final.model.js";
import { sanitizeInput } from "./sanitization.js"; // Adjusted for module import

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Get All Prescriptions (with Doctor info)
app.get("/api/prescriptions", async (req, res) => {
  try {
    const prescriptions = await Prescription.find().populate("doctor_id", "first_name last_name");
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add a Prescription
app.post("/api/prescriptions", async (req, res) => {
  try {
    const sanitizedFirstName = sanitizeInput(req.body.first_name, { trimWhitespace: true, maxLength: 50 }).sanitized;
    const sanitizedLastName = sanitizeInput(req.body.last_name, { trimWhitespace: true, maxLength: 50 }).sanitized;
    const sanitizedPatientName = sanitizeInput(req.body.patient_name, { trimWhitespace: true, maxLength: 100 }).sanitized;
    const sanitizedPrescriptionName = sanitizeInput(req.body.prescription_name, { trimWhitespace: true, maxLength: 100 }).sanitized;
    const sanitizedAmount = sanitizeInput(req.body.amount, { trimWhitespace: true }).sanitized;
    const sanitizedPatientSSN = sanitizeInput(req.body.patient_ssn, { trimWhitespace: true }).sanitized;

    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnRegex.test(sanitizedPatientSSN)) {
      return res.status(400).json({ success: false, message: "Invalid SSN format. Please use XXX-XX-XXXX format." });
    }

    const existingPrescription = await Prescription.findOne({ patient_ssn: sanitizedPatientSSN });
    if (existingPrescription) {
      return res.status(400).json({ success: false, message: "A prescription with this SSN already exists" });
    }

    let doctor = await Doctor.findOne({ first_name: sanitizedFirstName, last_name: sanitizedLastName });
    if (!doctor) {
      doctor = new Doctor({ first_name: sanitizedFirstName, last_name: sanitizedLastName });
      await doctor.save();
    }

    const newPrescription = new Prescription({
      prescription_name: sanitizedPrescriptionName,
      amount: parseFloat(sanitizedAmount),
      patient_name: sanitizedPatientName,
      patient_ssn: sanitizedPatientSSN,
      doctor_id: doctor._id,
    });

    await newPrescription.save();
    await newPrescription.populate("doctor_id", "first_name last_name");

    res.status(201).json({ success: true, data: newPrescription });
  } catch (error) {
    console.error("Full error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    res.status(500).json({ success: false, message: error.message || "Unexpected server error" });
  }
});

// Update a Prescription
app.put("/api/prescriptions/:id", async (req, res) => {
  try {
    const sanitizedFirstName = sanitizeInput(req.body.first_name, { trimWhitespace: true, maxLength: 50 }).sanitized;
    const sanitizedLastName = sanitizeInput(req.body.last_name, { trimWhitespace: true, maxLength: 50 }).sanitized;
    const sanitizedPatientName = sanitizeInput(req.body.patient_name, { trimWhitespace: true, maxLength: 100 }).sanitized;
    const sanitizedPrescriptionName = sanitizeInput(req.body.prescription_name, { trimWhitespace: true, maxLength: 100 }).sanitized;
    const sanitizedAmount = sanitizeInput(req.body.amount, { trimWhitespace: true }).sanitized;
    const sanitizedPatientSSN = sanitizeInput(req.body.patient_ssn, { trimWhitespace: true }).sanitized;

    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnRegex.test(sanitizedPatientSSN)) {
      return res.status(400).json({ success: false, message: "Invalid SSN format. Please use XXX-XX-XXXX format." });
    }

    const currentPrescription = await Prescription.findById(req.params.id);
    if (!currentPrescription) {
      return res.status(404).json({ success: false, message: "Prescription not found" });
    }

    if (sanitizedPatientSSN !== currentPrescription.patient_ssn) {
      const existingPrescription = await Prescription.findOne({ patient_ssn: sanitizedPatientSSN, _id: { $ne: req.params.id } });
      if (existingPrescription) {
        return res.status(400).json({ success: false, message: "A prescription with this SSN already exists" });
      }
    }

    let doctor = await Doctor.findOne({ first_name: sanitizedFirstName, last_name: sanitizedLastName });
    if (!doctor) {
      doctor = new Doctor({ first_name: sanitizedFirstName, last_name: sanitizedLastName });
      await doctor.save();
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        prescription_name: sanitizedPrescriptionName,
        amount: parseFloat(sanitizedAmount),
        patient_name: sanitizedPatientName,
        patient_ssn: sanitizedPatientSSN,
        doctor_id: doctor._id,
      },
      { new: true, runValidators: true }
    ).populate("doctor_id", "first_name last_name");

    res.json({ success: true, data: updatedPrescription });
  } catch (error) {
    console.error("Full error:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    res.status(500).json({ success: false, message: error.message || "Unexpected server error" });
  }
});

// Delete a Prescription
app.delete("/api/prescriptions/:id", async (req, res) => {
  try {
    const sanitizedId = sanitizeInput(req.params.id, { trimWhitespace: true }).sanitized;
    const deletedPrescription = await Prescription.findByIdAndDelete(sanitizedId);
    if (!deletedPrescription) return res.status(404).json({ message: "Prescription not found" });

    res.json({ success: true, message: "Prescription deleted successfully" });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get All Doctors
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("prescriptions");
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Reports Route
app.post("/api/reports", async (req, res) => {
  try {
    const sanitizedStartDate = sanitizeInput(req.body.startDate, { trimWhitespace: true }).sanitized;
    const sanitizedEndDate = sanitizeInput(req.body.endDate, { trimWhitespace: true }).sanitized;
    const sanitizedDoctorId = sanitizeInput(req.body.doctorId, { trimWhitespace: true }).sanitized;
    const sanitizedPrescriptionName = sanitizeInput(req.body.prescription_name, { trimWhitespace: true, maxLength: 100 }).sanitized;

    const query = {};
    if (sanitizedStartDate && sanitizedEndDate) {
      query.order_time = {
        $gte: new Date(sanitizedStartDate),
        $lte: new Date(sanitizedEndDate)
      };
    }
    if (sanitizedDoctorId) {
      query.doctor_id = sanitizedDoctorId;
    }
    if (sanitizedPrescriptionName) {
      query.prescription_name = { $regex: sanitizedPrescriptionName, $options: "i" };
    }

    const prescriptions = await Prescription.find(query).populate("doctor_id", "first_name last_name");

    res.json({ success: true, data: prescriptions });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



import path from 'path';
const __dirname = path.resolve();

// Serve static files from React's build directory in production
if (process.env.NODE_ENV === "production") {
  // Set the static folder to the build folder in your React app
  app.use(express.static(path.join(__dirname, "/frontend/build")));// "..", "client", "build")));
  // For any route that doesn't match the API, serve the React index.html
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));// "..", "client", "build", "index.html"));
  });
}



// Server Listener
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
