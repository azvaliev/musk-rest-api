const refreshDB = require('./db');

const fetch = require('node-fetch');
require('dotenv').config();

export interface Tweet {
	id: string;
	text: string;
}

interface TweetReqParams {
	'exclude': string;
	'tweet.fields': string;
	'max_results': string;
	'pagination_token'?: string;
}

interface TweetReqMeta {
	next_token: string;
}

interface TweetRes {
	data: Tweet[];
	meta: TweetReqMeta;
}

exports.handler = async () => {
	let paginationToken;
	const params: TweetReqParams = {
		'exclude': 'retweets,replies',
		'tweet.fields': 'text',
		'max_results': '100',
	};
	const allTweets: Tweet[] = [];
	if (!process.env.TWITTER_BEARER_TOKEN) throw new Error('No Twitter Bearer-Token detected');

	try {
		for (let i = 0; i < 9; i++) {
			if (paginationToken)  params['pagination_token'] = paginationToken;

			const response = await fetch('https://api.twitter.com/2/users/44196397/tweets?' + new URLSearchParams({
				...params
			}), {
				headers: {
					'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
				}
			});
			const tweets = await response.json() as TweetRes;
			const tweetArr = [...tweets.data];
			allTweets.push(...tweetArr);
			paginationToken = tweets.meta.next_token;
		}
	} catch (err) {
		console.error(err);
	}
	const filteredTweets = allTweets.filter(tweet => !tweet.text.includes('http'));

	const formattedTweets = filteredTweets.map((tweet) => ({
		...tweet,
		text: tweet.text.replace(/(\n)/g, ' ').replace(/(\s+)/g, ' ')
	}));

	return await refreshDB(formattedTweets);
};