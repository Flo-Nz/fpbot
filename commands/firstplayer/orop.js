import { SlashCommandBuilder, bold, hyperlink, userMention } from 'discord.js';
import axios from 'axios';
import { get, includes, isEmpty, invoke, deburr } from 'lodash-es';
import moment from 'moment';

moment.locale('fr');

// Orop stands for "On rejoue ou pas"
export const data = new SlashCommandBuilder()
    .setName('orop')
    .setDescription(
        "Demandez-lui s'il existe un épisode de 'On Y Rejoue Ou Pas' !"
    )
    .addStringOption((option) =>
        option
            .setName('titre')
            .setDescription('Titre du jeu à rechercher')
            .setRequired(true)
    );

const ytApiUrl = 'https://youtube.googleapis.com/youtube/v3/playlistItems';
const playlistId = process.env.FP_OYROP_PLAYLIST_ID;
const key = process.env.YOUTUBE_API_KEY;
const baseURL =
    process.env.NODE_ENV === 'PROD'
        ? process.env.API_BASE_URL
        : process.env.API_DEV_BASE_URL;
const headers = { apikey: process.env.FP_API_KEY };

const getFpApiOrop = async (prompt) => {
    try {
        const response = await axios({
            method: 'get',
            headers,
            baseURL,
            url: `/orop?title=${prompt}`,
        });
        if (response.status !== 200) {
            return undefined;
        }
        const { data } = response;
        return data;
    } catch (error) {
        return;
    }
};

const getPlaylist = async (pageToken) => {
    const response = await axios({
        method: 'get',
        url: ytApiUrl,
        params: {
            part: 'contentDetails,snippet',
            playlistId,
            pageToken,
            key,
        },
    });
    const { data } = response;
    return data;
};

const findTimestamp = (prompt, desc) => {
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

const findOrop = async (prompt, pageToken, skipApi) => {
    try {
        // We don't want the API to be called more than once (if we need to call findOrop again with a new pageToken)
        if (!skipApi) {
            const oropApiResult = await getFpApiOrop(prompt);
            if (oropApiResult) {
                console.log('OROP API RESULT', oropApiResult);
                const orop = { ...oropApiResult, found: true };
                console.log('OROP', orop);
                return orop;
            }
        }
        // If FP API did not return any result, try to find it on youtube !
        const orop = {};
        const oropPage = await getPlaylist(pageToken);
        for (const item of get(oropPage, 'items')) {
            if (
                includes(
                    deburr(item.snippet?.title.toLowerCase()),
                    deburr(prompt.toLowerCase())
                ) ||
                includes(
                    deburr(item.snippet?.description.toLowerCase()),
                    deburr(prompt.toLowerCase())
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
                await axios({
                    method: 'post',
                    headers,
                    baseURL,
                    url: '/fporop',
                    data: { title: prompt, fpOrop: orop },
                });
                return orop;
            }
        }
        if (isEmpty(orop) && oropPage.nextPageToken) {
            return findOrop(prompt, oropPage.nextPageToken, true);
        } else {
            orop.found = false;
            return orop;
        }
    } catch (error) {
        throw new Error(`Something Went Wrong, ${error.message}`);
    }
};

const isEphemeral = (interaction) => {
    if (interaction.guildId !== '933486333756846101') {
        return true;
    }
    if (interaction.channelId === '1175621884423966820') {
        return false;
    }
    return true;
};

export const execute = async (interaction) => {
    try {
        await interaction.deferReply({ ephemeral: isEphemeral(interaction) });
        const { username: user, id: userId } = interaction.member.user;
        const title = deburr(interaction.options.getString('titre'));

        console.log(`Recherche demandée par ${user}. Prompt: `, title);
        const orop = await findOrop(title);
        console.log(`Orop trouvé ? ${orop.found ? 'Yes' : 'No'}`);
        console.log('orop', orop);
        if (!orop.found) {
            return await interaction.editReply({
                content: `Désolé ${userMention(
                    userId
                )}, je n'ai pas trouvé d'épisode ${bold(
                    'On Rejoue Ou Pas ?'
                )} concernant ${title}! Tu peux toujours demander à Yoël, je ne suis pas infaillible :smile:`,
            });
        }

        return await interaction.editReply({
            content: `:partying_face: ${userMention(
                userId
            )}, j'ai trouvé un ${bold('On Rejoue Ou Pas')} concernant ${bold(
                title
            ).toUpperCase()} ! Il a été posté le ${bold(
                orop.publishedDate
            )} et tu peux le visionner sur ${hyperlink(
                'Youtube',
                orop.youtubeUrl
            )}`,
        });
    } catch (error) {
        throw new Error(`Something Went Wrong, ${error.message}`);
    }
};
