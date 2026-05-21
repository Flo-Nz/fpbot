import { apiClient } from './httpClient.js';

export const getTopRated = async (onlyFP) => {
    try {
        const response = await apiClient({
            method: 'get',
            url: '/orop/top/rated',
            params: {
                onlyFP: onlyFP === 'firstplayer' ? true : false,
            },
        });
        const { data } = response;
        return data;
    } catch (error) {
        return;
    }
};

export const getTopSearched = async (withVideo) => {
    try {
        const response = await apiClient({
            method: 'get',
            url: '/orop/top/searched',
            params: {
                withVideo,
            },
        });
        const { data } = response;
        return data;
    } catch (error) {
        return;
    }
};
