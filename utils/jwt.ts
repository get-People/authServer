import jwt from 'jsonwebtoken'
import { Request, Response } from 'express';

type Token = {
    firstName: string,
    lastName: string,
    email: string,
    isAdmin: boolean
}

export const generateAccessToken = ({ firstName,lastName,email,isAdmin}: Token) => {
    return jwt.sign({firstName,lastName,email,isAdmin},
        process.env.ACCESS_USER_TOKEN as string,
        { expiresIn: '2 days' })
}
export const generateRefreshToken= () => {}

