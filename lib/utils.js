import { fpEmojis, testEmojis } from './emojis.js';

export const emojisLib =
    process.env.NODE_ENV === 'PROD' ? fpEmojis : testEmojis;
export const ratingChannelId =
    process.env.NODE_ENV === 'PROD'
        ? '1181274025025097818'
        : '1181222402974302228';
