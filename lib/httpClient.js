import axios from 'axios';

const ytApiUrl = 'https://youtube.googleapis.com/youtube/v3';
const baseURL =
    process.env.NODE_ENV === 'PROD'
        ? process.env.API_BASE_URL
        : process.env.API_DEV_BASE_URL;
const headers = { apikey: process.env.FP_API_KEY };

export const apiClient = async (options) =>
    axios({
        headers,
        baseURL,
        ...options,
    });

export const youtubeClient = async (options) =>
    axios({
        baseURL: ytApiUrl,
        ...options,
    });
