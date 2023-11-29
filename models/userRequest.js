import mongoose from "mongoose";
import CategoryModel from "./category.js";

// Define the userRequest schema
const userRequestSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  image: { type: String, required: true, trim: true },
  donation_category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
  donation_amount: { type: Number, required: true, trim: true },
  donation_desc: { type: String, required: true, trim: true },
  phone_number: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  latitude: { type: String, required: true, trim: true },
  longitude: { type: String, required: true, trim: true },
  status: { type: Boolean, default: false },
});

// Create the userRequest model
const userRequest = mongoose.model('userRequest', userRequestSchema);

export default userRequest;
