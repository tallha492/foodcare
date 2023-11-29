import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import ngoRoutes from "./routes/ngoRoutes.js";
import connectDB from "./config/db.js";

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL

// cors policy
app.use(cors());

// connect DB
connectDB(DATABASE_URL);

// return json
app.use(express.json());

// load routes
app.use("/api/user", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api/ngo", ngoRoutes);

// port
app.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});
