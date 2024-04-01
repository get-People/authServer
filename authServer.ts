import express from 'express';
import https from 'https';
import fs from 'fs';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import purify from "./utils/sanitize";
import { authValidatorRegistration, authValidatorLogin } from './validation/authValidator';
import { generateAccessToken } from './utils/jwt';
import User from './models/user';
import connectToDatabase from './utils/databaseConnection';
import sendEmail from './utils/sendEmail';

const app = express();

const privatekey = fs.readFileSync(process.env.PRIVATE_KEY as string)
const certificate = fs.readFileSync(process.env.CERTIFICATE as string)

const credentials = {
    key: privatekey,
    cert: certificate,
};
connectToDatabase()

app.use(express.json())

const server = https.createServer(credentials, app)
const cookieOptions = {
        httpOnly: true,
        secure: true,
  };
app.post("/register", async (req, res) => {
  try {
    Object.keys(req.body).forEach((key) => {
      req.body[key] = purify.sanitize(req.body[key]);
    });

    console.log(req.body)
    const { error } = authValidatorRegistration.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({ email: req.body.email });
    if (user)  return res.status(409).send({ message: "you already registered! login instead" });

    const saltRounds = await bcrypt.genSalt(10);  
    req.body.password = await bcrypt.hash(req.body.password, saltRounds)
    
    const newUser = await User.create(req.body)
    const token = generateAccessToken(newUser)

  
    res.cookie("access token",
        token,
      cookieOptions).status(200).send({
          message: "register successfully",
          user: newUser
      })   
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Registration failed" });
    }
});

app.post("/login", async (req, res) => {
  try {
    Object.keys(req.body).forEach((key) => {
      req.body[key] = purify.sanitize(req.body[key]);
    });
      
    const { error } = authValidatorLogin.validate(req.body);
    if (error) return res.status(400).send({ errorMessage: error.details[0].message });
 
   
    const user = await User.findOne({ email: req.body["email"] });
    if (!user) return res.status(400).send({ message: "User not found" });
   

    const authCheck = await bcrypt.compare(req.body.password, user.password);
    const token = generateAccessToken(req.body);
    if (authCheck) {
        
    res.cookie("access token",
        token,
      cookieOptions).status(200).send({
          message: "access authorized",
          user
      })
      } else {
        return res.status(400).send({ message: "email or password are wrong" });
      }
    
  } catch (error) {
    console.log(error);
    res.status(500).send({ errorMessage: "login failed" });
  }
});

app.post("/forgot-password", async (req, res) => {
  try {
    Object.keys(req.body).forEach(key => {
      req.body[key] = purify.sanitize(req.body[key])
    }) 
    const { email,mainServerUrl } = req.body;
    const user = await User.findOne({ email: email });
    console.log(user)
    if (!user) return res.status(200).send({ message: "check your email" });
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // expires in 1 hour
    user.save();

    const resetUrl = `http://${mainServerUrl}/reset-password/${resetToken}`;
    const message = `<h1> you requested a reset password</h1> 
    <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>`;
    
    const isEmailSent = await sendEmail(email, "password reset request" , message);

    if (isEmailSent) {
      return res
        .status(200)
        .send({ message: "check your email for reset password link" });
    } else {
      return res.status(500).send({ error: "Email could not be sent" });
    }
  } catch (error) {}
});

server.listen(process.env.PORT as string,() => {
     console.log(`auth server is listening on port ${process.env.PORT}`)
 })