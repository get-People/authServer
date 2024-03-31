"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidatorLogin = exports.authValidatorRegistration = void 0;
const joi_1 = __importDefault(require("joi"));
exports.authValidatorRegistration = joi_1.default.object({
    firstName: joi_1.default.string().min(3).max(30).required(),
    lastName: joi_1.default.string().min(3).max(30).required(),
    email: joi_1.default.string().min(15).max(30).email().required(),
    password: joi_1.default.alternatives().try(joi_1.default.string().min(4), joi_1.default.number()).required(),
    isAdmin: joi_1.default.boolean().required()
});
exports.authValidatorLogin = joi_1.default.object({
    email: joi_1.default.string().min(15).max(30).email().required(),
    password: joi_1.default.alternatives().try(joi_1.default.string().min(4), joi_1.default.number()).required(),
    firstName: joi_1.default.string().min(3).max(30).optional(),
    lastName: joi_1.default.string().min(3).max(30).optional(),
    isAdmin: joi_1.default.boolean().optional(),
});
