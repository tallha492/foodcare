import ngoRequestModel from "../models/ngoRequest.js";
import userDonationModel from "../models/userDonation.js";
import userRequestModel from "../models/userRequest.js";
import ngoUserRequestModel from "../models/ngoUserRequest.js";
import mongoose from "mongoose";
class ngoController {
    static createRequest = async (req, res) => {
        const { ngo_id, image, donation_intro, donation_category, required_amount, donation_desc } = req.body
        try {
            const ngoRequestData = new ngoRequestModel({
                ngo_id: ngo_id,
                image: 'https://nationaltoday.com/wp-content/uploads/2021/12/Throw-Out-Your-Leftovers-Day-1200x834.jpg',
                donation_intro: donation_intro,
                donation_category: donation_category,
                required_amount: required_amount,
                donation_desc: donation_desc,
            });
            await ngoRequestData.save();
            res.status(201).send({ status: "success", message: "NGO Request Added Successfully!" })
        } catch (error) {
            res.status(400).send({ status: "failed", message: "NGO Request Not Saved!" });
        }
    }
    static getAllRequestsByNgo = async (req, res) => {
        const { ngo_id } = req.params;
        try {
            const requests = await ngoRequestModel.find({ ngo_id }).populate('donation_category', 'name').populate('ngo_id', 'fullName');
            if (requests.length > 0) {
                const simplifiedRequests = await Promise.all(requests.map(async (request) => {
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

                res.status(200).send({ status: "success", message: "Requests Fetched Successfully!", data: simplifiedRequests });
            }
            else {
                res.status(404).send({ status: "failed", message: "Requests Not Found!" });
            }
        } catch (error) {
            res.status(400).send({ status: "failed", message: "Something went wrong!" });
        }
    }

    static getRequestById = async (req, res) => {
        const { _id } = req.params;
        try {
            const request = await ngoRequestModel.findById(_id).populate('donation_category', 'name').populate('ngo_id', 'fullName');

            if (request) {
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
                const simplifiedRequest = {
                    _id: request._id,
                    ngo_name: request.ngo_id ? request.ngo_id.fullName : null,
                    image: request.image,
                    donation_intro: request.donation_intro,
                    donation_category: request.donation_category ? request.donation_category.name : null,
                    required_amount: request.required_amount,
                    donation_desc: request.donation_desc,
                    total_donation_amount: totalDonations ? totalDonations[0].totalDonationAmount : 0,
                };
                res.status(200).send({ status: "success", message: "Request Fetched Successfully!", data: simplifiedRequest });
            } else {
                res.status(404).send({ status: "failed", message: "Request Not Found!" });
            }
        } catch (error) {
            res.status(400).send({ status: "failed", message: "Something went wrong!" });
        }
    };


    static updateRequest = async (req, res) => {
        const { _id, image, donation_intro, donation_category, required_amount, donation_desc } = req.body;

        try {
            const updatedRequest = await ngoRequestModel
                .findOneAndUpdate(
                    { _id: _id },
                    {
                        $set: {
                            image: image,
                            donation_intro: donation_intro,
                            donation_category: donation_category,
                            required_amount: required_amount,
                            donation_desc: donation_desc,
                        },
                    },
                    { new: true }
                )
                .populate('donation_category', 'name');
            if (updatedRequest) {

                res.status(200).send({ status: "success", message: "NGO Request Updated Successfully!" });
            } else {
                res.status(404).send({ status: "failed", message: "NGO Request Not Found!" });
            }
        } catch (error) {
            res.status(400).send({ status: "failed", message: "NGO Request not updated!" });
        }
    }

    static deleteRequest = async (req, res) => {
        const { _id } = req.params;
        try {
            const deletedRequest = await ngoRequestModel.findOneAndDelete({ _id: _id })

            if (deletedRequest) {
                res.status(200).send({ status: "success", message: "NGO Request Deleted Successfully!" });
            } else {
                res.status(404).send({ status: "failed", message: "NGO Request Not Found!" });
            }
        } catch (error) {
            res.status(400).send({ status: "failed", message: "NGO Request Not Deleted!" });
        }
    }

    static getAllUserRequests = async (req, res) => {
        const { ngo_id } = req.params;
        try {
            const userRequests = await userRequestModel
                .find({ status: false })
                .populate('donation_category', 'name')
                .populate('user_id', 'fullName')
                .exec();
            const ngoObjectId = new mongoose.Types.ObjectId(ngo_id);
            const simplifiedRequests = await Promise.all(userRequests.map(async (request) => {
                const countData = await ngoUserRequestModel.countDocuments({
                    user_request_id: request._id,
                    ngo_id: ngoObjectId
                });

                if (countData === 0) {
                    return {
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
                } else {
                    return null; // If count is not zero, exclude the data
                }
            }));
            res.status(200).send({ status: "success", message: "Request Fetched Successfully!", data: simplifiedRequests });
        } catch (error) {
            console.error(error);
            res.status(400).send({ status: "error", message: "Something went wrong" });
        }


    }

    static getAllNgoUserRequests = async (req, res) => {

        const { ngoId, status } = req.params;

        if (!ngoId) {

            res.status(400).send({ status: "error", message: "NGO ID is required" });

        }
        else {
            try {

                const userRequests = await userRequestModel
                    .find()
                    .populate('donation_category', 'name')
                    .populate('user_id', 'fullName')
                    .exec();

                // ...

                const simplifiedRequests = await Promise.all(userRequests.map(async (request) => {
                    let countData = 0;

                    switch (status) {
                        case 'accepted':
                            countData = await ngoUserRequestModel.countDocuments({
                                user_request_id: request._id,
                                ngo_id: ngoId,
                                status: true
                            });
                            break;

                        case 'rejected':
                            countData = await ngoUserRequestModel.countDocuments({
                                user_request_id: request._id,
                                ngo_id: ngoId,
                                status: false
                            });
                            break;

                        // You can add more cases if needed

                        default:
                            break;
                    }

                    if (countData !== 0) {
                        return {
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
                    } else {
                        return null; // If count is not zero, exclude the data
                    }
                }));

                // Filter out null values
                const filteredRequests = simplifiedRequests.filter(request => request !== null);

                res.status(200).send({ status: "success", message: `${status} requests Fetched Successfully! `,data: filteredRequests});
            } catch (error) {
                console.log(error);
                res.status(400).send({ status: "error", message: "Something went wrong" });
            }

        }

    }

    static updateUserRequestByNgo = async (req, res) => {

        const { userRequestId, ngoId, status } = req.body;

        if (userRequestId && ngoId && status) {

            try {

                const ngoUserRequest = await ngoUserRequestModel.findOne({ user_request_id: userRequestId, ngo_id: ngoId })

                if (ngoUserRequest == null) {

                    // save ngo request
                    const saveNgoUserRequest = new ngoUserRequestModel({ user_request_id: userRequestId, ngo_id: ngoId, status: status })

                    await saveNgoUserRequest.save()

                    if (status === true) {

                        // update user request status
                        await userRequestModel.findByIdAndUpdate(userRequestId, { $set: { status: true } })

                    }

                }

                res.status(200).send({ status: "success", message: "User request updated successfully" });

            } catch (error) {
                res.status(400).send({ status: "error", message: "Something went wrong" });
            }

        }
        else {

            res.status(400).send({ status: "error", message: "All fields are required" });

        }

    }

}

export default ngoController;