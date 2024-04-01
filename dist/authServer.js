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
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const sanitize_1 = __importDefault(require("./utils/sanitize"));
const authValidator_1 = require("./validation/authValidator");
const jwt_1 = require("./utils/jwt");
const user_1 = __importDefault(require("./models/user"));
const databaseConnection_1 = __importDefault(require("./utils/databaseConnection"));
const sendEmail_1 = __importDefault(require("./utils/sendEmail"));
const app = (0, express_1.default)();
const privatekey = fs_1.default.readFileSync(process.env.PRIVATE_KEY);
const certificate = fs_1.default.readFileSync(process.env.CERTIFICATE);
const credentials = {
    key: privatekey,
    cert: certificate,
};
(0, databaseConnection_1.default)();
app.use(express_1.default.json());
const server = https_1.default.createServer(credentials, app);
const cookieOptions = {
    httpOnly: true,
    secure: true,
};
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        Object.keys(req.body).forEach((key) => {
            req.body[key] = sanitize_1.default.sanitize(req.body[key]);
        });
        console.log(req.body);
        const { error } = authValidator_1.authValidatorRegistration.validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);
        const user = yield user_1.default.findOne({ email: req.body.email });
        if (user)
            return res.status(409).send({ message: "you already registered! login instead" });
        const saltRounds = yield bcrypt_1.default.genSalt(10);
        req.body.password = yield bcrypt_1.default.hash(req.body.password, saltRounds);
        const newUser = yield user_1.default.create(req.body);
        const token = (0, jwt_1.generateAccessToken)(newUser);
        res.cookie("access token", token, cookieOptions).status(200).send({
            message: "register successfully",
            user: newUser
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ errorMessage: "Registration failed" });
    }
}));
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        Object.keys(req.body).forEach((key) => {
            req.body[key] = sanitize_1.default.sanitize(req.body[key]);
        });
        const { error } = authValidator_1.authValidatorLogin.validate(req.body);
        if (error)
            return res.status(400).send({ errorMessage: error.details[0].message });
        const user = yield user_1.default.findOne({ email: req.body["email"] });
        if (!user)
            return res.status(400).send({ message: "User not found" });
        const authCheck = yield bcrypt_1.default.compare(req.body.password, user.password);
        const token = (0, jwt_1.generateAccessToken)(req.body);
        if (authCheck) {
            res.cookie("access token", token, cookieOptions).status(200).send({
                message: "access authorized",
                user
            });
        }
        else {
            return res.status(400).send({ message: "email or password are wrong" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ errorMessage: "login failed" });
    }
}));
app.post("/forgot-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        Object.keys(req.body).forEach(key => {
            req.body[key] = sanitize_1.default.sanitize(req.body[key]);
        });
        const { email, mainServerUrl } = req.body;
        const user = yield user_1.default.findOne({ email: email });
        console.log(user);
        if (!user)
            return res.status(200).send({ message: "check your email" });
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // expires in 1 hour
        user.save();
        const resetUrl = `http://${mainServerUrl}/reset-password/${resetToken}`;
        let message = `<h1> you requested a reset password</h1> 
    <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>`;
        const isEmailSent = yield (0, sendEmail_1.default)(email, "password reset request", message);
        if (isEmailSent) {
            return res
                .status(200)
                .send({ message: "check your email for reset password link" });
        }
        else {
            return res.status(500).send({ error: "Email could not be sent" });
        }
    }
    catch (error) { }
}));
server.listen(process.env.PORT, () => {
    console.log(`auth server is listening on port ${process.env.PORT}`);
});
