const redis = require('redis');
import { Tweet } from '.';

const refreshDB = async (tweets: Tweet[]) => {

	const client = await redis.createClient({
		url: process.env.REDIS_URL
	});

	await client.connect();

	for (const tweet of tweets) {
		client.SET(tweet.id, tweet.text);
	}

	await client.disconnect();

	return true;
};

module.exports = refreshDB;