import { deburr, get, includes, invoke, isEmpty } from 'lodash-es';
import { apiClient, youtubeClient } from './httpClient.js';
import moment from 'moment';

const playlistId = process.env.FP_OYROP_PLAYLIST_ID;
moment.locale('fr');

export const getFpApiOrop = async (prompt) => {
    try {
        const response = await apiClient({
            method: 'get',
            url: `/orop?title=${prompt}`,
        });
        if (response.status !== 200) {
            return undefined;
        }
        const { data } = response;
        if (isEmpty(data.fpOrop)) {
            return;
        }
        return data;
    } catch (error) {
        return;
    }
};

export const getPlaylist = async (pageToken) => {
    const response = await youtubeClient({
        method: 'get',
        url: '/playlistItems',
        params: {
            part: 'contentDetails,snippet',
            playlistId,
            pageToken,
            key: process.env.YOUTUBE_API_KEY,
        },
    });
    const { data } = response;
    return data;
};

export const findTimestamp = (prompt, desc) => {
    // Split when we find the "OO:OO" which is the first chapter
    const firstSplit = desc.toLowerCase().split('00:00');
    // Then split again when we find the prompt
    const secondSplit = firstSplit[1]?.split(prompt.toLowerCase());
    const minutesRegex = /[0-9][0-9]:[0-9][0-9]/;
    // get the timestamps
    const result = invoke(secondSplit[1], 'match', minutesRegex);

    // if we got timestamps, the first one should be the one of the prompt. Transform it in seconds and return it.
    if (!isEmpty(result)) {
        return moment.duration(`00:${result[0]}`).asSeconds();
    }
};

export const findOrop = async (prompt, pageToken) => {
    try {
        // If there is a pageToken, we already have checked the API on the first round
        if (!pageToken) {
            const oropApiResult = await getFpApiOrop(prompt);
            if (oropApiResult) {
                console.log('OROP FOUND FROM API');
                const orop = {
                    ...oropApiResult,
                    ...oropApiResult.fpOrop,
                    found: true,
                };
                return orop;
            }
        }
        // If FP API did not return any result, try to find it on youtube !
        const orop = {};
        const oropPage = await getPlaylist(pageToken);
        for (const item of get(oropPage, 'items')) {
            if (
                includes(deburr(item.snippet?.title.toLowerCase()), prompt) ||
                includes(
                    deburr(item.snippet?.description.toLowerCase()),
                    prompt
                )
            ) {
                orop.found = true;
                orop.publishedDate = moment(item.snippet.publishedAt).format(
                    'L'
                );
                orop.videoTitle = item.snippet.title;
                orop.thumbnail = item.snippet.thumbnails.medium.url;
                const timestamp = findTimestamp(
                    prompt,
                    item.snippet.description
                );
                if (timestamp) {
                    orop.timestamp = timestamp;
                }
                orop.youtubeUrl = `https://www.youtube.com/watch?v=${
                    item.snippet.resourceId.videoId
                }&list=${playlistId}${timestamp ? `&t=${timestamp}s` : ''}`;
                //Post found orop in DB
                await apiClient({
                    method: 'post',
                    url: '/fporop',
                    data: { title: prompt, fpOrop: orop },
                });
                return orop;
            }
        }
        if (isEmpty(orop) && oropPage.nextPageToken) {
            return findOrop(prompt, oropPage.nextPageToken);
        } else {
            orop.found = false;
            return orop;
        }
    } catch (error) {
        throw new Error(`Something Went Wrong, ${error.message}`);
    }
};
