import mongoose from "mongoose";


// define schema
const userSchema = new mongoose.Schema({
    fullName : {type : String , required : true , trim : true},
    username : {type : String , required : true , trim : true},
    email : {type : String , required : true , trim : true},
    password : {type : String , required : true , trim : true},
    location : {type : String , required : true , trim : true},
    latitude : {type : String , required : true , trim : true},
    longitude : {type : String , required : true , trim : true},
    role : {type: String, enum : ['ngo','restaurant','user'], default: 'user'},
    verifiedAt : {type : Date , default: null},
    otp : {type : Number , trim : true , default: null},
    expriration : {type : Date , default: null},
})

// model
const UserModel = mongoose.model("user", userSchema)

export default UserModel