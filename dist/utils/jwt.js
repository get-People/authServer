"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = ({ firstName, lastName, email, isAdmin }) => {
    return jsonwebtoken_1.default.sign({ firstName, lastName, email, isAdmin }, process.env.ACCESS_USER_TOKEN, { expiresIn: '2 days' });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = () => { };
exports.generateRefreshToken = generateRefreshToken;
