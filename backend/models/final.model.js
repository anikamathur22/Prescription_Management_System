import mongoose from 'mongoose';


const doctorSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prescription" }] 
});

const Doctor = mongoose.model("Doctor", doctorSchema);

const prescriptionSchema = new mongoose.Schema({
  prescription_name: { 
    type: String, 
    required: true,  // Make prescription name a required field
    trim: true  // Remove whitespace from beginning and end
  },
  order_time: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  patient_name: { type: String, required: true },
  patient_ssn: { 
    type: String, 
    required: true,
    unique: true,  // Ensure SSN is unique across all prescriptions
    validate: {
      validator: function(v) {
        // Basic SSN validation regex
        return /^\d{3}-\d{2}-\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid SSN format! Use XXX-XX-XXXX`
    }
  },
  doctor_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Doctor", 
    required: true 
  }
}, { 
  timestamps: true  // Add createdAt and updatedAt timestamps
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export { Doctor, Prescription };
