"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidator = void 0;
const joi_1 = __importDefault(require("joi"));
exports.authValidator = joi_1.default.object({
    firstName: joi_1.default.string().min(3).max(30).required(),
    lastName: joi_1.default.string().min(3).max(30).required(),
    email: joi_1.default.string().min(15).max(30).email().required(),
    address: joi_1.default.object({
        country_id: joi_1.default.string().required(),
        city_id: joi_1.default.string().required(),
        street_id: joi_1.default.string().required(),
    }).optional(),
    age: joi_1.default.number().min(18).max(120).optional(),
});
