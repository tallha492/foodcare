import mongoose from "mongoose";
import CategoryModel from "./category.js";

// Define the ngoRequest schema
const ngoRequestSchema = new mongoose.Schema({
  ngo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  image: { type: String, required: true, trim: true },
  donation_intro: { type: String, required: true, trim: true },
  donation_category: { type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true },
  required_amount: { type: Number, required: true, trim: true },
  donation_desc: { type: String, required: true, trim: true },
  request_available : {type : Number , trim : true , default: 1},
  percentange_filled : {type : Number , trim : true,default: 0 },
});

// Create the ngoRequest model
const NgoRequest = mongoose.model('NgoRequest', ngoRequestSchema);

export default NgoRequest;
