import { fpEmojis, testEmojis } from './emojis.js';

export const isProd = process.env.NODE_ENV === 'PROD';

export const emojisLib = isProd ? fpEmojis : testEmojis;
export const ratingChannelId = isProd
    ? '1181274025025097818'
    : '1181222402974302228';
