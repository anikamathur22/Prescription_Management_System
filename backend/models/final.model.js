import mongoose from 'mongoose';

// Doctor Schema with compound index
const doctorSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  prescriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prescription" }]
});

// Compound index for (first_name, last_name)
doctorSchema.index({ first_name: 1, last_name: 1 });

const Doctor = mongoose.model("Doctor", doctorSchema);


// Prescription Schema with multiple indexes
const prescriptionSchema = new mongoose.Schema({
  prescription_name: { 
    type: String, 
    required: true,
    trim: true
  },
  order_time: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  patient_name: { type: String, required: true },
  patient_ssn: { 
    type: String,
    required: true,
    unique: true,  // Auto-indexed as unique
    validate: {
      validator: function(v) {
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
}, { timestamps: true });


// Index for doctor_id (used in multiple queries)
prescriptionSchema.index({ doctor_id: 1 });

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export { Doctor, Prescription };
