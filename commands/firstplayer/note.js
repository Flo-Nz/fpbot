import { SlashCommandBuilder, bold, userMention } from 'discord.js';
import { capitalize, deburr } from 'lodash-es';
import moment from 'moment';
import {
    generateRatingResponseRow,
    notYetRow,
    postRating,
    ratingsRow,
} from '../../lib/ratings.js';
import { findOrop } from '../../lib/orop.js';
import { generateRatingReplyContent } from '../../lib/textContent.js';

moment.locale('fr');

// Orop stands for "On rejoue ou pas"
export const data = new SlashCommandBuilder()
    .setName('note')
    .setDescription('Notez un jeu !')
    .addStringOption((option) =>
        option
            .setName('titre')
            .setDescription('Titre du jeu à noter')
            .setRequired(true)
    );

export const execute = async (interaction) => {
    try {
        await interaction.deferReply({ ephemeral: true });
        const { globalName: username, id: userId } = interaction.user;
        const title = deburr(
            interaction.options.getString('titre')
        ).toLowerCase();
        // We eventually want to add a new orop entry in DB.
        await findOrop(title);

        const reply = await interaction.editReply({
            content: `${userMention(userId)}, tu peux noter le jeu "${bold(
                capitalize(title)
            )}" en cliquant sur un des boutons ci-dessous (ou annuler via le bouton "pas joué")`,
            components: [ratingsRow, notYetRow],
        });
        try {
            const ratingResponse = await reply.awaitMessageComponent({
                time: 200000,
            });
            const { customId } = ratingResponse;
            let discordOrop;
            if (customId !== 'notyet') {
                discordOrop = await postRating(title, {
                    userId,
                    rating: ratingResponse.customId,
                });
                console.log('New Rating ! ', { title, username, customId });
            }
            return await interaction.editReply({
                content: generateRatingReplyContent(
                    discordOrop,
                    username,
                    customId
                ),
                components: [],
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
