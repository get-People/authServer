import mongoose from "mongoose"; 

const connectToDatabase = () => {
  
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL must be defined");
  }

  mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB", err));
};

export default connectToDatabase