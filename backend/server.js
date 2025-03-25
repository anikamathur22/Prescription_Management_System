import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { Doctor, Prescription } from "./models/final.model.js"; // Import models

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// **Connect to MongoDB**
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// **🔹 Get All Prescriptions (with Doctor info)**
app.get("/api/prescriptions", async (req, res) => {
  try {
    const prescriptions = await Prescription.find().populate("doctor_id", "first_name last_name");
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// **🔹 Add a Prescription (Assigning Doctor)**
// app.post("/api/prescriptions", async (req, res) => {
//   try {
//     const { first_name, last_name, amount, patient_name, patient_ssn } = req.body;

//     // 🔹 Find or Create Doctor
//     let doctor = await Doctor.findOne({ first_name, last_name });

//     if (!doctor) {
//       doctor = new Doctor({ first_name, last_name });
//       await doctor.save();
//     }

//     // 🔹 Create Prescription
//     const newPrescription = new Prescription({
//       amount,
//       patient_name,
//       patient_ssn,
//       doctor_id: doctor._id, // ✅ Assign correct doctor ID
//     });

//     await newPrescription.save();
//     res.status(201).json({ success: true, data: newPrescription });
//   } catch (error) {
//     console.error("Error adding prescription:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
app.post("/api/prescriptions", async (req, res) => {
    try {
      const { first_name, last_name, amount, patient_name, patient_ssn } = req.body;
      
      // Find or Create Doctor
      let doctor = await Doctor.findOne({ first_name, last_name });
      
      if (!doctor) {
        doctor = new Doctor({ first_name, last_name });
        await doctor.save();
      }
      
      // Create Prescription
      const newPrescription = new Prescription({
        amount,
        patient_name,
        patient_ssn,
        doctor_id: doctor._id,
      });
      
      // Save the prescription
      await newPrescription.save();
      
      // Populate doctor information before sending the response
      await newPrescription.populate("doctor_id", "first_name last_name");
      
      res.status(201).json({ 
        success: true, 
        data: newPrescription 
      });
    } catch (error) {
      console.error("Error adding prescription:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
 });

// **🔹 Modify a Prescription**
// app.put("/api/prescriptions/:id", async (req, res) => {
//   try {
//     const updatedPrescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });

//     if (!updatedPrescription) return res.status(404).json({ message: "Prescription not found" });

//     res.json({ success: true, data: updatedPrescription });
//   } catch (error) {
//     console.error("Error modifying prescription:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
app.put("/api/prescriptions/:id", async (req, res) => {
    try {
      const { first_name, last_name, amount, patient_name, patient_ssn } = req.body;
      
      // Find or create doctor
      let doctor = await Doctor.findOne({ first_name, last_name });
      if (!doctor) {
        doctor = new Doctor({ first_name, last_name });
        await doctor.save();
      }
      
      // Prepare update data
      const updateData = {
        amount,
        patient_name,
        patient_ssn,
        doctor_id: doctor._id
      };
      
      // Update prescription
      const updatedPrescription = await Prescription.findByIdAndUpdate(
        req.params.id, 
        updateData, 
        { new: true }
      ).populate("doctor_id", "first_name last_name");
      
      if (!updatedPrescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      
      res.json({ success: true, data: updatedPrescription });
    } catch (error) {
      console.error("Error modifying prescription:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

// **🔹 Delete a Prescription**
app.delete("/api/prescriptions/:id", async (req, res) => {
  try {
    const deletedPrescription = await Prescription.findByIdAndDelete(req.params.id);
    if (!deletedPrescription) return res.status(404).json({ message: "Prescription not found" });

    res.json({ success: true, message: "Prescription deleted successfully" });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// **🔹 Get All Doctors with Prescriptions**
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("prescriptions");
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// **Start server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});  