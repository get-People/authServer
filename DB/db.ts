import bcrypt from 'bcrypt';
import User from '../models/user';
import connectToDatabase from './databaseConnection';


type User = {
    firstName?: string,
    lastName?: string,
    email: string,
    password?: string,
    isAdmin?: Boolean,
    resetPasswordToken?: string,
    resetPasswordExpires?: Date
}
  async function hashPassword(password: string): Promise<string> {
    try {
        const saltRounds = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
}
class DB{
    static instance: DB;

    constructor() {
        if (DB.instance) {
            return DB.instance
        }
        try {
            connectToDatabase();
            DB.instance = this;   
        } catch (error) {
            console.error(error)
            console.error("Error connecting to the database:", error);
        }
    }

  async findUserByEmail(email: string) {
    const user = await User.findOne({ email: email });
    return user;
  }

  async addUser(user: User) {
    try {
    if (user.password) {
        user.password = await hashPassword(user.password)
      }
      return await User.create(user);
    } catch (error) {
      throw error;
    }
    }

    async findUserByToken(token: string) {
        try {
            return await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            })
        } catch (error) {
            console.error(error)
            throw error;
        }
    }

}

export default DB