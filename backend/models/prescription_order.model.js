import mongoose from 'mongoose';

const prescriptionOrderSchema = new mongoose.Schema({
    order_id: {
        type: Number,
        required: true
    },
    patient_id: {
        type: Number,
        required: false
    },
    doctor_id: {
        type: Number,
        required: false
    },
    prescription_id: {
        type: Number,
        required: false
    },
    order_time: {
        type: Date,
        required: false
    },

});


const PrescriptionOrder = mongoose.model("PrescriptionOrder", prescriptionOrderSchema);

export default PrescriptionOrder;


