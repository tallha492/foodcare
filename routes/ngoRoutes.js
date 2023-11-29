import express from "express"

const router = express.Router()

import checkUserAuth from "../middlewares/authMiddleware.js"
import ngoController from "../controllers/ngoController.js"

// route middleware
router.use('/createRequest', checkUserAuth)
router.use('/updateRequest', checkUserAuth)
router.use('/getAllRequestsByNgo', checkUserAuth)
router.use('/deleteRequest', checkUserAuth)
router.use('/getRequestById', checkUserAuth)
router.use('/getAllUserRequests', checkUserAuth)
router.use('/getAllNgoUserRequests', checkUserAuth)
router.use('/updateUserRequestByNgo', checkUserAuth)

// protected routes
router.post('/createRequest', ngoController.createRequest)
router.post('/updateRequest', ngoController.updateRequest)
router.get('/getAllRequestsByNgo/:ngo_id',ngoController.getAllRequestsByNgo)
router.get('/getRequestById/:_id', ngoController.getRequestById);
router.get('/deleteRequest/:_id',ngoController.deleteRequest)

router.get('/getAllUserRequests/:ngo_id',ngoController.getAllUserRequests)
router.get('/getAllNgoUserRequests/:ngoId/:status',ngoController.getAllNgoUserRequests)
router.post('/updateUserRequestByNgo',ngoController.updateUserRequestByNgo)


export default router