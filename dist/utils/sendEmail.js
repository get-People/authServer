"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = require("nodemailer");
const sendEmail = (to, subject, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transport = (0, nodemailer_1.createTransport)({
            "service": "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        yield transport.sendMail({
            from: process.env.EMAIL,
            to,
            subject,
            html: message
        });
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
exports.default = sendEmail;
