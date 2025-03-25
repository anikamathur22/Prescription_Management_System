import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
    patient_id: {
        type: Number,
        required: true
    },
    first_name: {
        type: String,
        required: false
    },
    last_name: {
        type: String,
        required: false
    }

});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
