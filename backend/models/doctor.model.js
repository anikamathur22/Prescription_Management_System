import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
    doctor_id: {
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
    },
    username: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },

}, 
{
    timestamps: true // createdAt, updatedAt
});


const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;


