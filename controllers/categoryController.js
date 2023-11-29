import categoryModel from "../models/category.js";

class CategoryController {
    static createCategory = async (req, res) => {
        const { name } = req.body
        const categoryExist = await categoryModel.findOne({ name: name });
        if (categoryExist) {
            res.status(400).send({ status: "failed", message: "Category already exists" });
        } else {
            try {
                const categoryData = new categoryModel({
                    name: name,
                });
                await categoryData.save();
                res.status(201).send({ status: "success", message: "Category Added Successfully!" })
            } catch (error) {
                res.status(400).send({ status: "failed", message: "Category Not Saved!" });
            }
        }
    }
    static getAllCategories = async (req, res) => {
        try {
            const categories = await categoryModel.find();
            res.status(200).send({ status: "success", message: "Categories Feteched Successfully!",  data: categories });
        } catch (error) {
            res.status(404).send({ status: "failed", message: "Categories not found!" });
        }
    }
}
export default CategoryController