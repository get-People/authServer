"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 30,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        minLength: 15,
        maxLength: 35,
        trim: true,
        lowercase: true
    }
});
const User = mongoose_1.default.model('user', userSchema);
exports.default = User;
