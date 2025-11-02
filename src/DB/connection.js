import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Database Connection Failed", error);
  }
};
export default connectDB;
