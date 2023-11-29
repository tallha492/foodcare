import mongoose from "mongoose";

// Define the userRequest schema
const ngoUserRequestSchema = new mongoose.Schema({
    user_request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'userRequest', required: true },
    ngo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    status: { type: Boolean , required: true},
});

// Create the userRequest model
const ngoUserRequest = mongoose.model('ngoUserRequest', ngoUserRequestSchema);

export default ngoUserRequest;
