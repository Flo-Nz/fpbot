import { SlashCommandBuilder, bold, userMention } from 'discord.js';
import { deburr } from 'lodash-es';
import {
    generateRatingResponseRow,
    generateTextRatingButton,
    notYetRow,
    postRating,
    ratingsRow,
} from '../../lib/ratings.js';
import { findOrop } from '../../lib/orop.js';
import { generateOropContent } from '../../lib/textContent.js';

// Orop stands for "On rejoue ou pas"
export const data = new SlashCommandBuilder()
    .setName('orop')
    .setDescription("Demandez s'il existe un épisode de 'On Rejoue Ou Pas' !")
    .addStringOption((option) =>
        option
            .setName('titre')
            .setDescription('Titre du jeu à rechercher')
            .setRequired(true)
    );

const isEphemeral = (interaction) => {
    if (
        interaction.channelId === '1175621884423966820' ||
        interaction.channelId === '1176664814924333157'
    ) {
        return false;
    }
    return true;
};

export const execute = async (interaction) => {
    try {
        await interaction.deferReply({ ephemeral: isEphemeral(interaction) });
        const { globalName: username, id: userId } = interaction.user;
        const title = deburr(
            interaction.options.getString('titre')
        ).toLowerCase();

        console.log(`Recherche demandée par ${username}. Prompt: `, title);
        const orop = await findOrop(title);
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

        const reply = await interaction.editReply({
            content: generateOropContent(title, orop, userId),
            components: [
                generateTextRatingButton(username),
                ratingsRow,
                notYetRow,
            ],
        });
        // Rating directly from the original reply with action buttons at the bottom
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
    } catch (error) {
        console.log('error', error);
        throw new Error(`Something Went Wrong, ${error.message}`);
    }
};
