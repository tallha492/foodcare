import express from "express"

const router = express.Router()

import checkUserAuth from "../middlewares/authMiddleware.js"
import CategoryController from "../controllers/categoryController.js"
// route middleware
router.use('/createCategory', checkUserAuth)
router.use('/getAllCategories', checkUserAuth)

// protected routes
router.post('/createCategory', CategoryController.createCategory)
router.get('/getAllCategories',CategoryController.getAllCategories)

export default router