import express from 'express';
import http from 'http';
import purify from "./utils/sanitize";
import { authValidator } from './validation/authValidator';
import User from './models/user';
import connectToDatabase from './utils/databaseConnection';
const app = express();

connectToDatabase()

app.use(express.json())

const server = http.createServer(app)

app.post("/register", async (req, res) => {
    try {
        Object.keys(req.body).forEach(key => {
            req.body[key] = purify.sanitize(req.body[key])
        })
        const { error } = authValidator.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const newUser = await User.create(req.body);
        res.status(200).send(newUser);
    } catch (error) {
        console.log(error)
        res.status(500).send({ errorMessage: "register fail" })
    }
})

app.post("/login", (req,res) => {
    try {
        Object.keys(req.body).forEach(key => {
            req.body[key] = purify.sanitize(req.body[key])
        })

        const user = User.findOne(req.body["email"]) 
        if (!user) return res.status(400).send({ message: "User not found" })
        return res.status(200).send({ message: "access authorized"})
    } catch (error) {
          console.log(error)
        res.status(500).send({ errorMessage: "login fail" })
    }
})

server.listen(process.env.PORT as string,() => {
     console.log(`auth server is listening on port ${process.env.PORT}`)
 })