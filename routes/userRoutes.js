import express from "express"

const router = express.Router()

import UserController from "../controllers/userController.js"
import checkUserAuth from "../middlewares/authMiddleware.js"

// route middleware

router.use('/changepassword',checkUserAuth)
router.use('/details',checkUserAuth)
router.use('/getAllNgoRequestsByArea',checkUserAuth)
router.use('/sendDonationToNgo',checkUserAuth)
router.use('/createUserRequest',checkUserAuth)
router.use('/getUserRequestById',checkUserAuth)
router.use('/getAllRequestsByUser',checkUserAuth)
router.use('/deleteUserRequest',checkUserAuth)
router.use('/changeUserLocation',checkUserAuth)
router.use('/deleteAccount',checkUserAuth)
router.get('/test', ( req, res) => {
    res.send("Hello World!!");
});




// public routes

router.post('/register',UserController.userRegistration)
router.post('/verify-account',UserController.verifyAccount)
router.post('/login',UserController.userLogin)
router.post('/send-reset-password-email',UserController.sendUserPasswordResetEmail)
router.post('/check-reset-password-otp',UserController.checkResetPasswordOtp)
router.post('/reset-password',UserController.resetPassword)




// protected routes
router.post('/changepassword',UserController.changeUserPassword)
router.get('/details',UserController.loggedUserData)
router.get('/getAllNgoRequestsByArea/:_id',UserController.getAllNgoRequestsByArea)
router.post('/sendDonationToNgo',UserController.sendDonationToNgo)
router.post('/createUserRequest',UserController.createUserRequest)
router.get('/getUserRequestById/:_id',UserController.getUserRequestById)
router.get('/getAllRequestsByUser/:user_id',UserController.getAllRequestsByUser)
router.get('/deleteUserRequest/:_id',UserController.deleteUserRequest)
router.post('/changeUserLocation',UserController.changeUserLocation)
router.get('/deleteAccount',UserController.deleteAccount)

export default router