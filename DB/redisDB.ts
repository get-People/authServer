import Redis from 'ioredis'


class RedisDB{
    static instance: RedisDB;
    public db: Redis | undefined;
    constructor() {

        if (RedisDB.instance) {
            return RedisDB.instance;
        }
        try {
            this.db = new Redis();

            this.db.on('connect', () => {
                console.log('Connected to Redis!');
            });
            this.db.on('error', (err) => {    
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