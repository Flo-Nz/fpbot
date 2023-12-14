import { fpEmojis, testEmojis } from './emojis.js';

export const isProd = process.env.NODE_ENV === 'PROD';

export const emojisLib = isProd ? fpEmojis : testEmojis;
export const ratingChannelId = isProd
    ? process.env.OROP_NOTE_CHANNEL_ID
    : process.env.OROP_NOTE_CHANNEL_ID_DEV;

export const oneDayOneGameChannelId = isProd
    ? process.env.UN_JOUR_UN_JEU_CHANNEL_ID
    : process.env.UN_JOUR_UN_JEU_CHANNEL_ID_DEV;
