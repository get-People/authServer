import Redis from 'ioredis'


class RedisDB{
    static instance: RedisDB;
    constructor() {

        if (RedisDB.instance) {
            return RedisDB.instance;
        }
        try {
            const redis = new Redis();

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

export default RedisDB;