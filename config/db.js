import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
    try {
        // Add your connection options if needed
        // const DB_OPTIONS = {
        //     dbName: "foorcare"
        // };

        if (!DATABASE_URL) {
            throw new Error("MongoDB connection URL is undefined");
        }

        await mongoose.connect(DATABASE_URL);

        console.log('Connected to the database successfully');
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;
