import { generateRatingResponseRow, postRating } from './ratings.js';

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
            await postRating(title, {
                userId,
                rating: ratingResponse.customId,
            });
            console.log('New Rating', {
                title,
                rating: ratingResponse.customId,
            });
        }
        return await interaction.editReply({
            components: generateRatingResponseRow(customId, username),
        });
    } catch (error) {
        return await interaction.editReply({
            components: generateRatingResponseRow('endoftime', username),
        });
    }
};
