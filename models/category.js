import mongoose from "mongoose";


// define schema
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
})

// model
const categoryModel = mongoose.model("category", categorySchema)

export default categoryModel