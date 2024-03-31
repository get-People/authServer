import express from 'express';
import https from 'https';
import fs from 'fs';
import bcrypt from 'bcrypt';
import purify from "./utils/sanitize";
import { authValidatorRegistration, authValidatorLogin } from './validation/authValidator';
import User from './models/user';
import connectToDatabase from './utils/databaseConnection';
import { generateAccessToken } from './utils/jwt';
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

app.get("/check", (req, res) => {
    try {
        res.send("Authentication server is running!");
    }
    catch (error: any) {
        res.status(500).send(error.message)
    }
})

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

server.listen(process.env.PORT as string,() => {
     console.log(`auth server is listening on port ${process.env.PORT}`)
 })