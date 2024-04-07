"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.tokenType = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var tokenType;
(function (tokenType) {
    tokenType["ACCESS"] = "access";
    tokenType["REFRESH"] = "refresh";
})(tokenType || (exports.tokenType = tokenType = {}));
const generateToken = (user, type) => {
    const token = type === tokenType.ACCESS ? process.env.ACCESS_TOKEN : process.env.REFRESH_TOKEN;
    const { firstName, lastName, email, isAdmin } = user;
    return jsonwebtoken_1.default.sign({ firstName, lastName, email, isAdmin }, token, { expiresIn: '2 days' });
};
exports.generateToken = generateToken;
