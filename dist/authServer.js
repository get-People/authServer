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
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const sanitize_1 = __importDefault(require("./utils/sanitize"));
const authValidator_1 = require("./validation/authValidator");
const auth_1 = require("./utils/auth");
const redisDB_1 = __importDefault(require("./DB/redisDB"));
const sendEmail_1 = __importDefault(require("./utils/sendEmail"));
const mongoDB_1 = __importDefault(require("./DB/mongoDB"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const db = new mongoDB_1.default();
const refreshTokens = new redisDB_1.default();
const privatekey = fs_1.default.readFileSync(process.env.PRIVATE_KEY);
const certificate = fs_1.default.readFileSync(process.env.CERTIFICATE);
const credentials = {
    key: privatekey,
    cert: certificate,
};
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
        const { error } = authValidator_1.authValidatorRegistration.validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);
        const user = yield db.findUserByEmail(req.body.email);
        if (user)
            return res.status(409).send({ message: "you already registered! login instead" });
        const newUser = yield db.addUser(req.body);
        const accessToken = (0, auth_1.generateToken)(newUser, auth_1.tokenType.ACCESS);
        const refreshToken = (0, auth_1.generateToken)(newUser, auth_1.tokenType.REFRESH);
        res.cookie("access token", accessToken, cookieOptions)
            .cookie("refresh token", refreshToken, cookieOptions)
            .status(200)
            .send({
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
        const user = yield db.findUserByEmail(req.body.email);
        if (!user)
            return res.status(400).send({ message: "User not found" });
        const authCheck = yield bcrypt_1.default.compare(req.body.password, user.password);
        const accessToken = (0, auth_1.generateToken)(user, auth_1.tokenType.ACCESS);
        const refreshToken = (0, auth_1.generateToken)(user, auth_1.tokenType.REFRESH);
        if (authCheck) {
            res.cookie("access token", accessToken, cookieOptions)
                .cookie("refresh token", refreshToken, cookieOptions)
                .status(200).send({
                message: "access authorized",
                user
            });
        }
        else {
            return res.status(400).send({ message: "email or password are wrong" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ errorMessage: "login failed" });
    }
}));
app.post("/forgot-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        Object.keys(req.body).forEach((key) => {
            req.body[key] = sanitize_1.default.sanitize(req.body[key]);
        });
        const { email, mainServerUrl } = req.body;
        const user = yield db.findUserByEmail(email);
        if (!user)
            return res.status(200).send({ message: "check your email" });
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // convert to string
        user.save();
        const resetUrl = `http://${mainServerUrl}/reset-password/${resetToken}`;
        const message = `<h1> you requested a reset password</h1>
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
    catch (error) {
        console.error(error);
    }
}));
app.post("/reset-password/:token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield db.findUserByToken(token);
        if (!user)
            return res.status(400).send({ error: "Password reset token is invalid or has expired" });
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        return res.status(200).send({ message: "password updated successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ error: "reset password failed" });
    }
}));
server.listen(process.env.PORT, () => {
    console.log(`auth server is listening on port ${process.env.PORT}`);
});
