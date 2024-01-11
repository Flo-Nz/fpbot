import { ComponentType, bold, channelMention } from 'discord.js';
import { postRatingEmbed } from './embed.js';
import {
    generateRatingResponseRow,
    generateTextRatingButton,
    postFpRating,
    postRating,
    ratingsRow,
    ratingsRow2,
} from './ratings.js';
import { isProd, ratingChannelId } from './utils.js';
import { capitalize } from 'lodash-es';
import { getOneOrop } from './cronTasks.js';
import { generateOropContent } from './textContent.js';

const handlePostRating = async ({ interaction, userId, title, rating }) => {
    try {
        if (userId === '250942701267058688') {
            const orop = await postFpRating(title, rating);
            console.log('[OROP] Rating Yoël', {
                title,
                rating,
            });
            return await postRatingEmbed({
                interaction,
                title,
                userId,
                orop,
                rating,
            });
        } else {
            const ratedOrop = await postRating(title, {
                userId,
                rating,
            });
            console.log('[OROP] Rating Discord', {
                title,
                rating,
            });
            const { orop, created, updated } = ratedOrop;
            return await postRatingEmbed({
                interaction,
                title,
                userId,
                orop,
                created: created,
                updated: updated,
                rating,
            });
        }
    } catch (error) {
        console.log('[HANDLE POST RATING] error', error);
    }
};

export const handleNoteRating = async ({
    interaction,
    reply,
    userId,
    title,
    rating,
}) => {
    try {
        if (!reply && !rating) {
            return await interaction.editReply({
                components: generateRatingResponseRow(
                    'endoftime',
                    interaction.user.username
                ),
            });
        }
        if (!reply && rating) {
            await handlePostRating({ interaction, userId, title, rating });
            return await interaction.editReply({
                content: `J'ai noté le jeu ${bold(
                    capitalize(title)
                )} dans le channel ${channelMention(ratingChannelId)}`,
                components: [],
            });
        }
        const ratingResponse = await reply.awaitMessageComponent({
            time: 200000,
        });
        const { customId } = ratingResponse;
        if (customId !== 'notyet') {
            await handlePostRating({
                interaction,
                userId,
                title,
                rating: customId,
            });

            return await interaction.editReply({
                content: `J'ai noté le jeu ${bold(
                    capitalize(title)
                )} dans le channel ${channelMention(ratingChannelId)}`,
                components: [],
            });
        }
        return await interaction.editReply({
            components: generateRatingResponseRow(
                customId,
                interaction.user.username
            ),
        });
    } catch (error) {
        console.log('[HANDLE RATING] Error', error);
        return await interaction.editReply({
            components: generateRatingResponseRow(
                'endoftime',
                interaction.user.username
            ),
        });
    }
};

export const handleOropRating = async ({
    interaction,
    reply,
    userId,
    title,
}) => {
    try {
        const collector = await reply.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: isProd ? 3600000 : 60000,
        });
        collector.on('collect', async (interact) => {
            const { customId } = interact;
            interact.deferUpdate();
            if (interact.user.id === '250942701267058688') {
                await postFpRating(title, customId);
            } else {
                await postRating(
                    title,
                    {
                        userId: interact.user.id,
                        rating: customId,
                    },
                    true
                );
            }
            const newOrop = await getOneOrop(title, true);
            console.log('[OROP] Noté', {
                username: interact.user.username,
                title: title,
                rating: customId,
            });
            interaction.editReply({
                content: generateOropContent(title, newOrop, userId),
                components: [
                    generateTextRatingButton(),
                    ratingsRow,
                    ratingsRow2,
                ],
            });
        });

        collector.on('end', async () => {
            const lastOrop = await getOneOrop(title, true);
            interaction.editReply({
                content: generateOropContent(title, lastOrop, userId),
                components: [generateTextRatingButton('end')],
            });
        });
    } catch (error) {
        console.log('error', error);
        return await interaction.editReply({
            components: generateRatingResponseRow(
                'endoftime',
                interaction.user.username
            ),
        });
    }
};
