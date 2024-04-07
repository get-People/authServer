"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
class RedisDB {
    constructor() {
        if (RedisDB.instance) {
            return RedisDB.instance;
        }
        try {
            const redis = new ioredis_1.default();
            redis.on('connect', () => {
                console.log('Connected to Redis!');
            });
            redis.on('error', (err) => {
                console.log('Redis Client Error', err);
            });
            RedisDB.instance = this;
        }
        catch (error) {
            console.error('Error connecting to Redis:', error);
            throw error;
        }
    }
}
exports.default = RedisDB;
