import {
    ComponentType,
    SlashCommandBuilder,
    bold,
    inlineCode,
} from 'discord.js';
import {
    getUserRatings,
    nextRatingsRow,
    noMoreRatingsRow,
    previousAndNextRatingsRow,
    previousRatingsRow,
} from '../../lib/mesnotes.js';
import { filter, upperCase } from 'lodash-es';
import { emojisLib } from '../../lib/utils.js';
import { generateUserRatingsEmbed } from '../../lib/embed.js';

// Orop stands for "On rejoue ou pas"
export const data = new SlashCommandBuilder()
    .setName('mesnotes')
    .setDescription('La liste de toutes les notes que tu as donné');

const getRatingsFields = (userRatings, userId) => {
    const fields = [];
    for (const game of userRatings) {
        const userRating = filter(
            game.discordOrop.ratings,
            (rating) => rating.userId === userId
        );
        fields.push({
            name: `${bold(upperCase(game.title[0]))}`,
            value: emojisLib[userRating.rating],
            inline: true,
        });
    }
    return fields;
};

const getOrUpdateUserRatings = async (interaction, userId) => {
    let skip = 0;
    const userRatings = await getUserRatings(userId, skip);
    if (userRatings.length === 0) {
        return interaction.editReply({ components: [noMoreRatingsRow] });
    }
    const message = await interaction.editReply({
        content: 'Voici ton top',
        embeds: generateUserRatingsEmbed(getRatingsFields(userRatings, userId)),
        components: [nextRatingsRow],
    });

    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 200000,
    });

    collector.on('collect', async (interact) => {
        const { customId } = interact;
        interact.deferUpdate();
        if (customId === 'nextratings') {
            skip = skip + 12;
            const newUserRatings = await getUserRatings(userId, skip);
            const keepGoing = newUserRatings.length === 12;
            interaction.editReply({
                content: keepGoing
                    ? 'Clique sur le bouton pour voir la suite !'
                    : 'On a fait le tour de tes notes !',
                embeds: generateUserRatingsEmbed(
                    getRatingsFields(newUserRatings, userId)
                ),
                components: keepGoing
                    ? [previousAndNextRatingsRow]
                    : [previousRatingsRow],
            });
        }
        if (customId === 'previousratings') {
            skip = skip - 12;
            const newUserRatings = await getUserRatings(userId, skip);
            interaction.editReply({
                content: 'Clique sur le bouton pour voir la suite !',
                embeds: generateUserRatingsEmbed(
                    getRatingsFields(newUserRatings, userId)
                ),
                components:
                    skip === 0 ? [nextRatingsRow] : [previousAndNextRatingsRow],
            });
        }
    });

    collector.on('end', () =>
        interaction.editReply({
            content: `Je suis passé à autre chose, refais ${inlineCode(
                '/mesnotes'
            )} pour recommencer`,
            components: [],
        })
    );
};

export const execute = async (interaction) => {
    try {
        await interaction.deferReply({ ephemeral: true });
        const { id: userId } = interaction.user;
        return await getOrUpdateUserRatings(interaction, userId);
    } catch (error) {
        await interaction.editReply({
            content: "On a un problème, c'est sans doute la faute à Deroubax.",
        });
        console.log('error', error);
        throw new Error(`Something Went Wrong, ${error.message}`);
    }
};
