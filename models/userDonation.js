import mongoose from "mongoose";


// define schema
const userDonationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'NgoRequest', required: true },
    donation_amount: { type: Number, required: true, trim: true },
    phone_number: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    latitude: { type: String, required: true, trim: true },
    longitude: { type: String, required: true, trim: true }
})

// model
const userDonationModel = mongoose.model("userDonation", userDonationSchema)

export default userDonationModel