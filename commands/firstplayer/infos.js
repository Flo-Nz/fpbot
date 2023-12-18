import { SlashCommandBuilder } from 'discord.js';
import { deburr } from 'lodash-es';
import { generateGameInfos } from '../../lib/embed.js';
import { getOneOrop } from '../../lib/cronTasks.js';
import { notYetRow, ratingsRow } from '../../lib/ratings.js';
import { handleNoteRating } from '../../lib/handleRating.js';

// Orop stands for "On rejoue ou pas"
export const data = new SlashCommandBuilder()
    .setName('infos')
    .setDescription('Les infos sur un jeu')
    .addStringOption((option) =>
        option
            .setName('titre')
            .setDescription('Titre du jeu à rechercher')
            .setRequired(true)
    );

export const execute = async (interaction) => {
    try {
        await interaction.deferReply({ ephemeral: true });
        const { username, id: userId } = interaction.user;
        const title = deburr(
            interaction.options.getString('titre')
        ).toLowerCase();
        const game = await getOneOrop(title);

        if (!game) {
            const reply = await interaction.editReply({
                content: `Désolé, le jeu ${interaction.options.getString(
                    'titre'
                )} n'est pas encore en base. Si tu veux le noter, n'hésite pas !`,
                components: [ratingsRow, notYetRow],
            });

            return await handleNoteRating({
                interaction,
                reply,
                userId,
                username,
                title,
            });
        }
        const reply = await interaction.editReply({
            content: "Voici les informations que j'ai trouvé concernant ce jeu",
            embeds: [generateGameInfos(game, userId)],
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
        await interaction.editReply({
            content: "On a un problème, c'est sans doute la faute à Deroubax.",
        });
        console.log('error', error);
        throw new Error(`Something Went Wrong, ${error.message}`);
    }
};
