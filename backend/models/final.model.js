import mongoose from 'mongoose';


const doctorSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prescription" }] // ✅ Ensure this exists
});

const Doctor = mongoose.model("Doctor", doctorSchema);



const prescriptionSchema = new mongoose.Schema({
    order_time: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    patient_name: { type: String, required: true },
    patient_ssn: { type: String, required: true },
    doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true } // Added reference to Doctor
});

// const doctorSchema = new mongoose.Schema({
//     first_name: { type: String, required: true },
//     last_name: { type: String, required: true },
//     // prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prescription" }] // Reference prescriptions
// }, { timestamps: true });

// const Doctor = mongoose.model("Doctor", doctorSchema);
const Prescription = mongoose.model("Prescription", prescriptionSchema);

export { Doctor, Prescription };
