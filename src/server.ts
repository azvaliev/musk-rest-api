import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';
import refreshTweets from './refreshTweets.js';

const main = async () => {
	const app = express();
	refreshTweets();
	
};
main();