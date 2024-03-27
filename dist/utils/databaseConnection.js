"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectToDatabase = () => {
    if (!process.env.MONGODB_URL) {
        throw new Error("MONGODB_URL must be defined");
    }
    mongoose_1.default.connect(process.env.MONGODB_URL)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("Error connecting to MongoDB", err));
};
exports.default = connectToDatabase;
