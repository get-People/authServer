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
const sanitize_1 = __importDefault(require("./utils/sanitize"));
const authValidator_1 = require("./validation/authValidator");
const user_1 = __importDefault(require("./models/user"));
const databaseConnection_1 = __importDefault(require("./utils/databaseConnection"));
const app = (0, express_1.default)();
const privatekey = fs_1.default.readFileSync('./security/privatekey.pem');
const certificate = fs_1.default.readFileSync('./security/certificate.pem');
const credentials = {
    key: privatekey,
    cert: certificate,
};
(0, databaseConnection_1.default)();
app.use(express_1.default.json());
const server = https_1.default.createServer(credentials, app);
app.get("/check", (req, res) => {
    try {
        res.send("Authentication server is running!");
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        Object.keys(req.body).forEach(key => {
            req.body[key] = sanitize_1.default.sanitize(req.body[key]);
        });
        const { error } = authValidator_1.authValidator.validate(req.body);
        if (error)
            return res.status(400).send(error.details[0].message);
        const user = yield user_1.default.findOne({ email: req.body.email });
        if (user) {
            return res.status(409).send({ message: "you already registered! you can login" });
        }
        const newUser = yield user_1.default.create(req.body);
        res.status(200).send({ message: "User registered successfully", userId: newUser._id });
    }
    catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).send(error.message);
        }
        else {
            res.status(500).send({ errorMessage: "Registration failed" });
        }
    }
}));
app.post("/login", (req, res) => {
    try {
        Object.keys(req.body).forEach(key => {
            req.body[key] = sanitize_1.default.sanitize(req.body[key]);
        });
        const user = user_1.default.findOne(req.body["email"]);
        if (!user)
            return res.status(400).send({ message: "User not found" });
        return res.status(200).send({ message: "access authorized" });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ errorMessage: "login fail" });
    }
});
server.listen(process.env.PORT, () => {
    console.log(`auth server is listening on port ${process.env.PORT}`);
});
