import jwt from 'jsonwebtoken'
import { Request, Response } from 'express';

type User = {
    firstName?: string,
    lastName?: string,
    email: string,
    password?: string,
    isAdmin?: Boolean,
}

export const generateToken = (user: User) => {
    const {firstName, lastName, email, isAdmin} = user;
    return jwt.sign({firstName, lastName, email, isAdmin},
        process.env.ACCESS_TOKEN as string,
        { expiresIn: '2 days' })
}
export const generateRefreshToken = (user: User) => { 
   
}


