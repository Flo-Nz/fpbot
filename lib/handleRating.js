import { bold, channelMention } from 'discord.js';
import { postRatingEmbed } from './embed.js';
import {
    generateRatingResponseRow,
    postFpRating,
    postRating,
} from './ratings.js';
import { ratingChannelId } from './utils.js';
import { capitalize } from 'lodash-es';

const handlePostRating = async ({ interaction, userId, title, rating }) => {
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
};

export const handleNoteRating = async ({
    interaction,
    reply,
    userId,
    username,
    title,
    rating,
}) => {
    try {
        if (!reply && !rating) {
            return await interaction.editReply({
                components: generateRatingResponseRow('endoftime', username),
            });
        }
        if (!reply && rating) {
            await handlePostRating({ interaction, userId, title, rating });
            return await interaction.editReply({
                content: `J'ai noté le jeu ${bold(
                    capitalize(title)
                )} dans le channel ${channelMention(ratingChannelId)}`,
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
            });
        }
    } catch (error) {
        return await interaction.editReply({
            components: generateRatingResponseRow('endoftime', username),
        });
    }
};

export const handleOropRating = async ({
    interaction,
    reply,
    userId,
    username,
    title,
}) => {
    try {
        const filter = (event) => event.user.id === userId;
        const ratingResponse = await reply.awaitMessageComponent({
            filter,
            time: 200000,
        });
        const { customId } = ratingResponse;
        if (customId !== 'notyet') {
            console.lo;
            await handlePostRating({
                interaction,
                userId,
                title,
                rating: customId,
            });
            return await interaction.editReply({
                components: generateRatingResponseRow(customId, username),
            });
        }
    } catch (error) {
        console.log('error', error);
        return await interaction.editReply({
            components: generateRatingResponseRow('endoftime', username),
        });
    }
};
