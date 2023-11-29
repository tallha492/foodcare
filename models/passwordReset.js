import mongoose from "mongoose";

// define schema
const passwordResetSchema = new mongoose.Schema({
    email : {type : String , required : true , trim : true},
    otp : {type : Number , required : true , trim : true},
    expriration : {type : Date , required : true},
})

// model
const passwordReset = mongoose.model("passwordReset", passwordResetSchema)

export default passwordReset