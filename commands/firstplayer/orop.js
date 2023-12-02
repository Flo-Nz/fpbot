import { SlashCommandBuilder, bold, userMention } from 'discord.js';
import { deburr } from 'lodash-es';
import {
    generateTextRatingButton,
    notYetRow,
    ratingsRow,
} from '../../lib/ratings.js';
import { findOrop } from '../../lib/orop.js';
import { generateOropContent } from '../../lib/textContent.js';
import { handleOropRating } from '../../lib/handleRating.js';

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
        const { username, id: userId } = interaction.user;
        const title = deburr(
            interaction.options.getString('titre')
        ).toLowerCase();

        console.log(`Recherche demandée par ${username}. Prompt: `, title);
        const orop = await findOrop(title);
        console.log('orop', orop);
        if (!orop.found) {
            const notFoundReply = await interaction.editReply({
                content: `Désolé ${userMention(
                    userId
                )}, je n'ai pas trouvé d'épisode ${bold(
                    'On Rejoue Ou Pas ?'
                )} concernant ${title}! Tu peux toujours demander à Yoël, je ne suis pas infaillible :smile:\nEn revanche, n'hésite pas à noter le jeu !`,
                components: [
                    generateTextRatingButton(username),
                    ratingsRow,
                    notYetRow,
                ],
            });
            return handleOropRating({
                interaction,
                reply: notFoundReply,
                userId,
                username,
                title,
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
        return handleOropRating({
            interaction,
            reply,
            userId,
            username,
            title,
        });
    } catch (error) {
        console.log('error', error);
        throw new Error(`Something Went Wrong, ${error.message}`);
    }
};
