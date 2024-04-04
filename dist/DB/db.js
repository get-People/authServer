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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const databaseConnection_1 = __importDefault(require("./databaseConnection"));
class DB {
    constructor() {
        if (DB.instance) {
            return DB.instance;
        }
        try {
            (0, databaseConnection_1.default)();
            DB.instance = this;
        }
        catch (error) {
            console.log(error);
            console.error("Error connecting to the database:", error);
        }
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield user_1.default.findOne({ email: email });
            return user;
        });
    }
    addUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (user.password) {
                    user.password = yield hashPassword(user.password);
                }
                return yield user_1.default.create(user);
            }
            catch (error) {
                throw error;
            }
        });
    }
    findUserByToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield user_1.default.findOne({
                    resetPasswordToken: token,
                    resetPasswordExpires: {
                        $gt: Date.now()
                    }
                });
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
}
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const saltRounds = yield bcrypt_1.default.genSalt(10);
            const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
            return hashedPassword;
        }
        catch (error) {
            throw error;
        }
    });
}
exports.default = DB;
