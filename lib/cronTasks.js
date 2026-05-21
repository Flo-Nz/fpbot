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

const getRandomOrop = async () => {
    try {
        const response = await apiClient({
            method: 'get',
            url: 'one-day-one-game',
        });
        const { data } = response;
        return data;
    } catch (error) {
        console.log('getRandomOrop error', error.message);
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
        if (error.response?.status === 404) {
            console.log(`getOneOrop - not found: ${title}`);
            return undefined;
        }
        console.error('getOneOrop - API error', error.message);
        throw error;
    }
};

export const oneDayOneGame = async (client) => {
    try {
        const randomOrop = await getRandomOrop();

        if (!randomOrop) {
            console.log('[Un jour un jeu] Aucun jeu disponible aujourd\'hui');
            return;
        }

        const channel = await client.channels.fetch(oneDayOneGameChannelId);
        const message = await channel.send({
            content: `${bold('[UN JOUR UN JEU]')}`,
            embeds: [generateGameInfos(randomOrop)],
            components: [ratingsRow, ratingsRow2],
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: isProd ? 82800000 : 60000,
            dispose: true,
        });

        let newRatings = 0;
        const users = [];
        const userLastRating = {};
        collector.on('collect', async (interact) => {
            if (!users.find((userId) => userId === interact.user.id)) {
                newRatings++;
                users.push(interact.user.id);
            }
            const { customId } = interact;
            await interact.deferUpdate().catch(() => {});

            // Skip API call if user already gave the same rating
            if (userLastRating[interact.user.id] === customId) {
                return;
            }
            userLastRating[interact.user.id] = customId;

            try {
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
                await message.edit({
                    content: bold(
                        `[UN JOUR UN JEU] Noté ${newRatings} fois aujourd'hui.`
                    ),
                    embeds: [generateGameInfos(newOrop)],
                    components: [ratingsRow, ratingsRow2],
                });
            } catch (err) {
                console.error('[Un jour un jeu] Erreur collector', err.message);
            }
        });

        collector.on('end', async () => {
            try {
                const lastOrop = await getOneOrop(randomOrop.title[0], true);
                await message.edit({
                    content: `[UN JOUR UN JEU] C'est terminé ! Ce jeu a été noté ${newRatings} fois aujourd'hui !`,
                    embeds: [generateGameInfos(lastOrop)],
                    components: [],
                });
            } catch (err) {
                console.error('[Un jour un jeu] Erreur end collector', err.message);
            }
        });
    } catch (error) {
        console.log('oneDayOneGame error', error);
    }
};
