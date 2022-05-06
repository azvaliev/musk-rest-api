import { AsyncLocalStorage } from 'async_hooks';
import fetch from 'node-fetch';
import { Tweet } from './types';

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

const refreshTweets = async () => {
	let paginationToken;
	const params: TweetReqParams = {
		'exclude': 'retweets,replies',
		'tweet.fields': 'text',
		'max_results': '100',
	};
	const allTweets: Tweet[] = [];

	try {
		for (let i = 0; i < 9; i++) {
			if (paginationToken)  params['pagination_token'] = paginationToken;

			const response = await fetch('https://api.twitter.com/2/users/44196397/tweets?' + new URLSearchParams({
				...params
			}), {
				headers: {
					'Authorization': `Bearer ${process.env.BEARER_TOKEN!}`
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

	return formattedTweets;

};

export default refreshTweets;
