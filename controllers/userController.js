import UserModel from "../models/user.js";
import ngoRequestModel from "../models/ngoRequest.js";
import PasswordReset from "../models/passwordReset.js";
import userDonationModel from "../models/userDonation.js";
import userRequestModel from "../models/userRequest.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/email.js";
import geolib from 'geolib';

class UserController {


    //---------------------Auth Apis-----------------------------------------------
    static userRegistration = async (req, res) => {

        const { fullName, username, email, password, location, latitude, longitude, role } = req.body


        const userByEmail = await UserModel.findOne({ email: email });
        const userByUsername = await UserModel.findOne({ username: username });

        if (userByEmail) {
            res.status(400).send({ status: "failed", message: "Email already exists" });
        } else if (userByUsername) {
            res.status(400).send({ status: "failed", message: "Username already exists" });
        }
        else {
            if (fullName && username && email && password && location && role) {
                try {

                    const salt = await bcrypt.genSalt(12)
                    const encryptPassword = await bcrypt.hash(password, salt)

                    const otp = Math.floor(1000 + Math.random() * 9000);

                    const otpExpiration = new Date();
                    otpExpiration.setMinutes(otpExpiration.getMinutes() + 30);

                    const userReg = new UserModel({
                        fullName: fullName,
                        username: username,
                        email: email,
                        password: encryptPassword,
                        location: location,
                        latitude: latitude,
                        longitude: longitude,
                        role: role,
                        otp: otp,
                        expriration: otpExpiration,

                    })

                    await userReg.save()

                    await transporter.sendMail({
                        from: process.env.EMAIL_FROM,
                        to: email,
                        subject: `${process.env.APP_NAME} - Account Verification`,
                        html: `Your account verification OTP: ${otp}`
                    })

                    res.status(201).send({ status: "success", message: "User register successfully , please check your email to verify the account" })

                } catch (error) {
                    res.status(400).send({ status: "failed", message: error })
                }

            }
            else {
                res.status(400).send({ status: "failed", message: "All fields are required" })
            }

        }
    }

    static verifyAccount = async (req, res) => {

        const { otp } = req.body

        if (otp) {

            const user = await UserModel.findOne({ otp: otp })

            if (user) {

                // Check if the current time is before the OTP expiration time
                const isOtpValid = new Date() < user.expriration;

                if (isOtpValid) {

                    // update verification
                    const verificationDateTime = new Date()
                    await UserModel.findByIdAndUpdate(user._id, { $set: { verifiedAt: verificationDateTime, otp: null } })

                    res.status(201).send({ status: "success", message: "Account verified successfully" })

                }
                else {

                    res.status(400).send({ status: "failed", message: "Otp is expired , kindly send reset password request again" })

                }

            }
            else {

                res.status(400).send({ status: "failed", message: "Invalid Otp" })

            }

        }
        else {
            res.status(400).send({ status: "failed", message: "Otp is required" })
        }

    }

    static userLogin = async (req, res) => {

        try {

            const { username, password } = req.body

            if (username && password) {

                const isUser = await UserModel.findOne({ username: username })

                if (isUser != null) {
                    const isMatch = await bcrypt.compare(password, isUser.password)

                    if ((username === isUser.username) && isMatch) {

                        if (isUser.verifiedAt != null) {

                            // generate Jwt Token
                            const token = jwt.sign({ userId: isUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })

                            // Assuming isUser is a Mongoose document
                            const sanitizedUser = isUser.toObject(); // Convert Mongoose document to plain JavaScript object

                            // Exclude fields from the response
                            delete sanitizedUser.verifiedAt;
                            delete sanitizedUser.otp;
                            delete sanitizedUser.expriration;
                            delete sanitizedUser.__v;

                            res.status(200).send({ status: "success", message: "Login successfully", isVerified: true, token: token, data: sanitizedUser })

                        }
                        else {

                            const otp = Math.floor(1000 + Math.random() * 9000);

                            const otpExpiration = new Date();
                            otpExpiration.setMinutes(otpExpiration.getMinutes() + 30);

                            await UserModel.findByIdAndUpdate(isUser._id, {
                                $set: {
                                    otp: otp,
                                    expiration: otpExpiration,
                                }
                            })

                            await transporter.sendMail({
                                from: process.env.EMAIL_FROM,
                                to: isUser.email,
                                subject: `${process.env.APP_NAME} - Account Verification`,
                                html: `Your account verification OTP: ${otp}`
                            })

                            res.status(201).send({ status: "success", message: "Please check your email to verify the account", isVerified: false })

                        }

                    }
                    else {
                        res.status(400).send({ status: "failed", message: "Invalid username or password" })
                    }
                }
                else {
                    res.status(400).send({ status: "failed", message: "User is not registered" })
                }

            }
            else {
                res.status(400).send({ status: "failed", message: "All fields are required" })
            }

        } catch (error) {

            console.log(error)
            res.status(400).send({ status: "failed", message: "Unable to login" })

        }
    }

    static changeUserPassword = async (req, res) => {

        const { password, confirm_password } = req.body

        if (password && confirm_password) {

            if (password !== confirm_password) {
                res.status(400).send({ status: "failed", message: "New password and confirm password doesn't match" })
            }
            else {
                const salt = await bcrypt.genSalt(12)
                const newEncryptedPassword = await bcrypt.hash(password, salt)

                // update password
                await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newEncryptedPassword } })

                res.status(201).send({ status: "success", message: "Password changed successfully" })
            }
        }
        else {
            res.status(400).send({ status: "failed", message: "All fields are required" })
        }

    }

    static changeUserLocation = async (req, res) => {

        try {
            const { location, latitude, longitude } = req.body;
    
            // Update location, latitude, and longitude
            await UserModel.findByIdAndUpdate(req.user._id, {
                $set: { location: location, latitude: latitude, longitude: longitude }
            });
    
            res.status(201).send({ status: "success", message: "Location updated successfully" });
        } catch (error) {
            res.status(400).send({ status: "error", message: "Location Not Updated!" });
        }
    }

    static loggedUserData = async (req, res) => {

        res.status(200).send({ status: "success", user: req.user })

    }

    static sendUserPasswordResetEmail = async (req, res) => {

        try {


            const { email } = req.body

            if (email) {

                const user = await UserModel.findOne({ email: email })

                if (user) {

                    // check if it's end before then update it otherwise create
                    const isPasswordReset = await PasswordReset.findOne({ email: user.email })

                    const otp = Math.floor(1000 + Math.random() * 9000);

                    const otpExpiration = new Date();
                    otpExpiration.setMinutes(otpExpiration.getMinutes() + 30);

                    if (isPasswordReset) {

                        // update otp and datetime                    
                        await PasswordReset.findOneAndUpdate({ email: isPasswordReset.email }, { $set: { otp: otp, expriration: otpExpiration } })

                    }
                    else {

                        // save otp and dateTime
                        const saveOtp = new PasswordReset({ email: user.email, otp: otp, expriration: otpExpiration })

                        await saveOtp.save()

                    }

                    let info = await transporter.sendMail({
                        from: process.env.EMAIL_FROM,
                        to: user.email,
                        subject: `${process.env.APP_NAME} - Reset Password`,
                        html: `Your reset password OTP: ${otp}`
                    })

                    res.status(201).send({ status: "success", message: "Password reset otp sent , please check your email" })

                }
                else {
                    res.status(400).send({ status: "failed", message: "Email doesn't exists" })
                }

            }
            else {
                res.status(400).send({ status: "failed", message: "Email is required" })
            }

        }
        catch (error) {
            res.status(400).send({ status: "failed", message: "Invalid host credentails" })
        }


    }

    static checkResetPasswordOtp = async (req, res) => {

        const { otp } = req.body

        if (otp) {

            const isOtp = await PasswordReset.findOne({ otp: otp })

            if (isOtp) {

                // Check if the current time is before the OTP expiration time
                const isOtpValid = new Date() < isOtp.expriration;

                if (isOtpValid) {

                    res.status(201).send({ status: "success", message: "Otp is valid" })

                }
                else {

                    res.status(400).send({ status: "failed", message: "Otp is expired , kindly send reset password request again" })

                }

            }
            else {

                res.status(400).send({ status: "failed", message: "Invalid Otp" })

            }

        }
        else {
            res.status(400).send({ status: "failed", message: "Otp is required" })
        }

    }

    static resetPassword = async (req, res) => {

        const { otp, password, confirm_password } = req.body

        if (otp && password && confirm_password) {

            if (password !== confirm_password) {


                res.status(400).send({ status: "failed", message: "Password and confirm password doesn't match" })

            }
            else {

                const passwordReset = await PasswordReset.findOne({ otp: otp })

                if (passwordReset) {

                    // Check if the current time is before the OTP expiration time
                    const isOtpValid = new Date() < passwordReset.expriration;

                    if (isOtpValid) {

                        const salt = await bcrypt.genSalt(12)
                        const newEncryptedPassword = await bcrypt.hash(password, salt)

                        // update password
                        await UserModel.findOneAndUpdate({ email: passwordReset.email }, { $set: { password: newEncryptedPassword } })

                        await PasswordReset.findOneAndDelete({ email: passwordReset.email })

                        res.status(201).send({ status: "success", message: "Password changed successfully" })

                    }
                    else {

                        res.status(400).send({ status: "failed", message: "Otp is expired , kindly send reset password request again" })

                    }

                }
                else {
                    res.status(400).send({ status: "failed", message: "Invalid Otp" })
                }


            }

        }
        else {
            res.status(400).send({ status: "failed", message: "All fields are required" })
        }
    }


    //---------------------End Auth Apis----------------------------------------------------------------

    //--------------------- User/Restaurant Requests Apis-----------------------------------------------

    static getAllNgoRequestsByArea = async (req, res) => {
        const { _id } = req.params;

        try {
            // Find the user's location based on _id
            const user = await UserModel.findById(_id);
            if (!user) {
                return res.status(404).send({ status: "failed", message: "User Not Found!" });
            }

            const userLocation = {
                latitude: user.latitude,
                longitude: user.longitude,
            };
            // Find the ngos within 40km from the user's location
            const requests = await ngoRequestModel.find({ request_available: 1 })
                .populate('donation_category', 'name')
                .populate('ngo_id', 'fullName longitude latitude');

            const nearbyNgos = requests.filter(request => {
                const ngoLocation = {
                    latitude: request.ngo_id.latitude,
                    longitude: request.ngo_id.longitude,
                };
                const distance = geolib.getDistance(userLocation, ngoLocation);
                return distance <= 40000; // 40km in meters
            });
            if (nearbyNgos.length > 0) {
                const simplifiedRequests = await Promise.all(nearbyNgos.map(async (request) => {
                    // Calculate total donation amount for each request
                    const totalDonations = await userDonationModel.aggregate([
                        {
                            $match: { request_id: request._id }
                        },
                        {
                            $group: {
                                _id: null,
                                totalDonationAmount: { $sum: '$donation_amount' }
                            }
                        }
                    ]);

                    return {
                        _id: request._id,
                        ngo_name: request.ngo_id ? request.ngo_id.fullName : null,
                        image: request.image,
                        donation_intro: request.donation_intro,
                        donation_category: request.donation_category ? request.donation_category.name : null,
                        required_amount: request.required_amount,
                        donation_desc: request.donation_desc,
                        total_donation_amount: totalDonations ? totalDonations[0].totalDonationAmount : 0,
                    };
                }));

                res.status(200).send({ status: "success", message: "Nearby Requests Fetched Successfully!", data: simplifiedRequests });
            } else {
                res.status(404).send({ status: "failed", message: "No Nearby Requests Found!" });
            }
        } catch (error) {
            res.status(400).send({ status: "failed", message: "Something went wrong!" });
        }
    };

    static sendDonationToNgo = async (req, res) => {
        const { user_id, request_id, donation_amount, phone_number, location, latitude, longitude } = req.body;
        try {
            // Check if the request exists
            const request = await ngoRequestModel.findById(request_id);
            if (!request) {
                return res.status(404).send({ status: "failed", message: "Request not found!" });
            }

            // Check if the request is available
            if (request.request_available === 0) {
                return res.status(400).send({ status: "failed", message: "Request is not available for donation!" });
            }
            const totalDonations = await userDonationModel.aggregate([
                {
                    $match: { request_id: request._id }
                },
                {
                    $group: {
                        _id: null,
                        totalDonationAmount: { $sum: '$donation_amount' }
                    }
                }
            ]);

            const remainingAmount = request.required_amount - (totalDonations != null && totalDonations.length > 0 ? totalDonations[0].totalDonationAmount : 0);
            if (donation_amount > remainingAmount) {
                return res.status(400).send({ status: "failed", message: `Donation amount exceeds the remaining amount (${remainingAmount}).` });
            }

            if (request.required_amount === 0) {
                request.request_available = 0;
            }

            await request.save();

            // Save the donation data
            const donation_data = new userDonationModel({
                user_id: user_id,
                request_id: request_id,
                donation_amount: donation_amount,
                phone_number: phone_number,
                location: location,
                latitude: latitude,
                longitude: longitude,
            });

            await donation_data.save();
            res.status(201).send({ status: "success", message: "Donation sent Successfully!" });
        } catch (error) {
            console.log(error);
            res.status(400).send({ status: "failed", message: "Something went wrong" });
        }
    };

    static createUserRequest = async (req, res) => {
        const { user_id, image, donation_category, donation_amount, donation_desc, phone_number, location, latitude, longitude } = req.body
        try {
            const userRequestData = new userRequestModel({
                user_id: user_id,
                image: 'https://nationaltoday.com/wp-content/uploads/2021/12/Throw-Out-Your-Leftovers-Day-1200x834.jpg',
                donation_category: donation_category,
                donation_amount: donation_amount,
                donation_desc: donation_desc,
                phone_number: phone_number,
                location: location,
                latitude: latitude,
                longitude: longitude
            });
            await userRequestData.save();
            res.status(201).send({ status: "success", message: "Request has been sent to NGO Successfully!" })
        } catch (error) {
            res.status(400).send({ status: "failed", message: "User Request Not Saved!" });
        }
    }


    static getUserRequestById = async (req, res) => {
        const { _id } = req.params;
        try {
            const request = await userRequestModel.findById(_id).populate('donation_category', 'name').populate('user_id', 'fullName');

            if (request) {
                const simplifiedRequest = {
                    _id: request._id,
                    user_name: request.user_id ? request.user_id.fullName : null,
                    image: request.image,
                    donation_category: request.donation_category ? request.donation_category.name : null,
                    donation_amount: request.donation_amount,
                    donation_desc: request.donation_desc,
                    phone_number: request.phone_number,
                    location: request.location,
                    latitude: request.latitude,
                    longitude: request.longitude
                };
                res.status(200).send({ status: "success", message: "Request Fetched Successfully!", data: simplifiedRequest });
            } else {
                res.status(404).send({ status: "failed", message: "Request Not Found!" });
            }
        } catch (error) {
            res.status(400).send({ status: "failed", message: "Something went wrong!" });
        }
    };


    static getAllRequestsByUser = async (req, res) => {
        const { user_id } = req.params;
        try {
            const requests = await userRequestModel.find({ user_id }).populate('donation_category', 'name').populate('user_id', 'fullName');
            if (requests.length > 0) {
                const simplifiedRequests = requests.map(request => ({
                    _id: request._id,
                    user_name: request.user_id ? request.user_id.fullName : null,
                    image: request.image,
                    donation_category: request.donation_category ? request.donation_category.name : null,
                    donation_amount: request.donation_amount,
                    donation_desc: request.donation_desc,
                    phone_number: request.phone_number,
                    location: request.location,
                    latitude: request.latitude,
                    longitude: request.longitude
                }));
                res.status(200).send({ status: "success", message: "Requests Fetched Successfully!", data: simplifiedRequests });
            }
            else {
                res.status(404).send({ status: "failed", message: "Requests Not Found!" });
            }
        } catch (error) {
            res.status(400).send({ status: "failed", message: "Something went wrong!" });
        }
    }


    static deleteUserRequest = async (req, res) => {
        const { _id } = req.params;
        try {
            const deletedRequest = await userRequestModel.findOneAndDelete({ _id: _id })

            if (deletedRequest) {
                res.status(200).send({ status: "success", message: "User Request Deleted Successfully!" });
            } else {
                res.status(404).send({ status: "failed", message: "User Request Not Found!" });
            }
        } catch (error) {
            res.status(400).send({ status: "failed", message: "User Request Not Deleted!" });
        }
    }

    //---------------------End User/Restaurant Requests Apis--------------------------------------------


    static deleteAccount = async (req, res) => {

            try {

                const { username, password } = req.body
    
                if (username && password) {
    
                    const isUser = await UserModel.findById({ username: username })
    
                    if (isUser != null) {
                        const isMatch = await bcrypt.compare(password, isUser.password)
    
                        if ((username === isUser.username) && isMatch) {
    
                            UserModel.deleteOne( { username: isUser.username } )

                            res.status(201).send({ status: "success", message: "Account deleted successfully" })
    
                        }
                        else {
                            res.status(400).send({ status: "failed", message: "Password is incorrect" })
                        }
                    }
                    else {
                        res.status(400).send({ status: "failed", message: "User is not registered" })
                    }
    
                }
                else {
                    res.status(400).send({ status: "failed", message: "All fields are required" })
                }
    
            } catch (error) {
    
                res.status(400).send({ status: "failed", message: "Internal server error" })
    
            }

      
    }


}

export default UserController