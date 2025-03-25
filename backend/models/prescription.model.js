import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
    prescription_id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    amount: {
        type: Number,
        required: false
    }

});


const Prescription = mongoose.model("Prescription", PrescriptionSchema);

export default Prescription;