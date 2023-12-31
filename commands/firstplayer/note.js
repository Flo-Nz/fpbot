import { SlashCommandBuilder, bold, userMention } from 'discord.js';
import { capitalize, deburr } from 'lodash-es';
import moment from 'moment';
import { notYetRow, ratingsRow } from '../../lib/ratings.js';
import { handleNoteRating } from '../../lib/handleRating.js';

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
    )
    .addIntegerOption((option) =>
        option
            .setName('rating')
            .setDescription('Votre note "orop" sur le jeu')
            .setMinValue(1)
            .setMaxValue(5)
            .setRequired(false)
    );

export const execute = async (interaction) => {
    try {
        await interaction.deferReply({ ephemeral: true });
        const { username, id: userId } = interaction.user;
        const title = deburr(
            interaction.options.getString('titre')
        ).toLowerCase();

        const commandRating = interaction.options.getInteger('rating');
        if (commandRating) {
            console.log('[NOTE] Command Rating');
            return await handleNoteRating({
                interaction,
                userId,
                username,
                title,
                rating: commandRating,
            });
        }

        console.log('[NOTE] Command Buttons');
        const reply = await interaction.editReply({
            content: `${userMention(userId)}, tu peux noter le jeu "${bold(
                capitalize(title)
            )}" en cliquant sur un des boutons ci-dessous (ou annuler via le bouton "pas joué")`,
            components: [ratingsRow, notYetRow],
        });

        return await handleNoteRating({
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
