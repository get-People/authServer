import express from 'express';
import https from 'https';
import fs from 'fs';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import purify from "./utils/sanitize";
import { authValidatorRegistration, authValidatorLogin } from './validation/authValidator';
import { generateToken ,tokenType} from './utils/auth';
import RedisDB from './DB/redisDB'
import sendEmail from './utils/sendEmail';
import DB from './DB/mongoDB';

const app = express();
app.use(express.json());

const db = new DB();
const refreshTokens = new RedisDB()
const privatekey = fs.readFileSync(process.env.PRIVATE_KEY as string)
const certificate = fs.readFileSync(process.env.CERTIFICATE as string)

const credentials = {
    key: privatekey,
    cert: certificate,
};

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

    const { error } = authValidatorRegistration.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await db.findUserByEmail(req.body.email);
    if (user)  return res.status(409).send({ message: "you already registered! login instead" });
    
    const newUser = await db.addUser(req.body)
    const accessToken = generateToken(newUser, tokenType.ACCESS)
    const refreshToken = generateToken(newUser,tokenType.REFRESH)
    

    res.cookie("access token", accessToken, cookieOptions)
       .cookie("refresh token", refreshToken, cookieOptions)
       .status(200)
       .send({
          message: "register successfully",
          user: newUser
       });
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
 
   
    const user = await db.findUserByEmail(req.body.email)
    if (!user) return res.status(400).send({ message: "User not found" });
   

    const authCheck = await bcrypt.compare(req.body.password, user.password);
    const accessToken = generateToken(user, tokenType.ACCESS);
    const refreshToken = generateToken(user, tokenType.REFRESH);
    if (authCheck) {

      res.cookie("access token", accessToken, cookieOptions)
        .cookie("refresh token", refreshToken, cookieOptions)
        .status(200).send({
          message: "access authorized",
          user
      })
      } else {
        return res.status(400).send({ message: "email or password are wrong" });
      }
    
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "login failed" });
  }
});

app.post("/forgot-password", async (req, res) => {
  try {
    Object.keys(req.body).forEach((key) => {
      req.body[key] = purify.sanitize(req.body[key]);
    });
    const { email, mainServerUrl } = req.body;
    const user = await db.findUserByEmail(email);
    if (!user) return res.status(200).send({ message: "check your email" });
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // convert to string
    user.save();

    const resetUrl = `http://${mainServerUrl}/reset-password/${resetToken}`;
    const message = `<h1> you requested a reset password</h1>
    <p>Click this <a href="${resetUrl}">link</a> to reset your password</p>`;

    const isEmailSent = await sendEmail(
      email,
      "password reset request",
      message
    );

    if (isEmailSent) {
      return res
        .status(200)
        .send({ message: "check your email for reset password link" });
    } else {
      return res.status(500).send({ error: "Email could not be sent" });
    }
  } catch (error) {
   console.error(error)
  }
});

app.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.findUserByToken(token);
    if (!user) return res.status(400).send({ error: "Password reset token is invalid or has expired" });  
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(200).send({ message: "password updated successfully" });
   }
  catch (error) {
    console.error(error);
    res.status(500).send({error: "reset password failed"});
  }
 })
server.listen(process.env.PORT as string,() => {
     console.log(`auth server is listening on port ${process.env.PORT}`)
 })