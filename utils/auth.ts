import jwt from 'jsonwebtoken'
import { Request, Response } from 'express';

type User = {
    firstName?: string,
    lastName?: string,
    email: string,
    password?: string,
    isAdmin?: Boolean,
}
export enum tokenType{
    ACCESS = 'access',
    REFRESH= 'refresh',
}
export const generateToken = (user: User, type: tokenType) => {
    const token = type === tokenType.ACCESS ? process.env.ACCESS_TOKEN as string : process.env.REFRESH_TOKEN as string;
    const {firstName, lastName, email, isAdmin} = user;
    return jwt.sign({ firstName, lastName, email, isAdmin },
        token, 
        { expiresIn: '2 days' })
}


