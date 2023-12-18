import { isProd, oneDayOneGameChannelId } from './utils.js';
import {
    postFpRating,
    postRating,
    ratingsRow,
    ratingsRow2,
} from './ratings.js';
import { apiClient } from './httpClient.js';
import { generateGameInfos } from './embed.js';
import { ComponentType, bold } from 'discord.js';
import { find } from 'lodash-es';

const getAllOrops = async () => {
    try {
        const response = await apiClient({ method: 'get', url: 'orop/all' });
        const { data } = response;
        return data;
    } catch (error) {
        console.log(('getAllOrops error', error.message));
    }
};

export const getOneOrop = async (title, skipSearchInc) => {
    try {
        const response = await apiClient({
            method: 'get',
            url: 'orop',
            params: { title, skipSearchInc },
        });
        const { data } = response;
        return data;
    } catch (error) {
        console.log('getOneOrop - error', error.message);
    }
};

export const oneDayOneGame = async (client) => {
    try {
        const allOrops = await getAllOrops();
        const randomOrop =
            allOrops[Math.floor(Math.random() * allOrops.length)];
        const channel = await client.channels.fetch(oneDayOneGameChannelId);
        const message = await channel.send({
            content: `${bold('[UN JOUR UN JEU]')}`,
            embeds: [generateGameInfos(randomOrop)],
            components: [ratingsRow, ratingsRow2],
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: isProd ? 82800000 : 60000,
        });

        let newRatings = 0;
        const users = [];
        collector.on('collect', async (interact) => {
            if (!find(users, (userId) => userId === interact.user.id)) {
                newRatings++;
                users.push(interact.user.id);
            }
            const { customId } = interact;
            interact.deferUpdate();
            if (interact.user.id === '250942701267058688') {
                await postFpRating(randomOrop.title[0], customId);
            } else {
                await postRating(
                    randomOrop.title[0],
                    {
                        userId: interact.user.id,
                        rating: customId,
                    },
                    true
                );
            }
            const newOrop = await getOneOrop(randomOrop.title[0], true);
            console.log('[Un jour un jeu] Noté', {
                username: interact.user.username,
                title: randomOrop.title[0],
                rating: customId,
            });
            message.edit({
                content: bold(
                    `[UN JOUR UN JEU] Noté ${newRatings} fois aujourd'hui.`
                ),
                embeds: [generateGameInfos(newOrop)],
                components: [ratingsRow, ratingsRow2],
            });
        });

        collector.on('end', async () => {
            const lastOrop = await getOneOrop(randomOrop.title[0], true);
            message.edit({
                content: `[UN JOUR UN JEU] C'est terminé ! Ce jeu a été noté ${newRatings} fois aujourd'hui !`,
                embeds: [generateGameInfos(lastOrop)],
                components: [],
            });
        });
    } catch (error) {
        console.log('oneDayOneGame error', error);
    }
};
