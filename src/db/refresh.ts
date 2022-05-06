import redis from 'redis';
import { Tweet } from '../types';

const refreshDB = async (tweets: Tweet[]) => {

	const client = await redis.createClient({
		url: process.env.REDIS_URL
	});

	await client.connect();

	for (const tweet of tweets) {
		client.SET(tweet.id, tweet.text);
	}

};

export default refreshDB;