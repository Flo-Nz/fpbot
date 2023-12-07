import { SlashCommandBuilder, userMention } from 'discord.js';
import { getTopRated, getTopSearched } from '../../lib/top.js';
import {
    generateTopRatedEmbed,
    generateTopSearchedEmbed,
} from '../../lib/embed.js';

// Orop stands for "On rejoue ou pas"
export const data = new SlashCommandBuilder()
    .setName('top')
    .setDescription('Top notes ou Top recherches')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('notes')
            .setDescription('Top notes de Yoel ou du Discord')
            .addStringOption((option) =>
                option
                    .setName('filter')
                    .setDescription('Notes de Yoël ou tout le Discord ?')
                    .addChoices(
                        { name: 'firstplayer', value: 'firstplayer' },
                        { name: 'discord', value: 'discord' }
                    )
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('recherches')
            .setDescription('Top des recherches avec orop de Yoel ou au global')
            .addBooleanOption((option) =>
                option
                    .setName('firstplayer')
                    .setDescription(
                        "Jeux dont un épisode d'OROP est disponible"
                    )
                    .setRequired(true)
            )
    );

export const execute = async (interaction) => {
    try {
        await interaction.deferReply({ ephemeral: true });
        const { id: userId } = interaction.user;
        console.log(
            'interaction bool',
            interaction.options.getBoolean('firstplayer')
        );
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'recherches') {
            const withVideo = interaction.options.getBoolean('firstplayer');
            const top = await getTopSearched(withVideo);
            console.log(`[TOP SEARCHED] with orop :${withVideo}`);
            return await interaction.editReply({
                content: `${userMention(userId)}, voici le top demandé !`,
                embeds: [generateTopSearchedEmbed(top, withVideo)],
            });
        }

        if (subcommand === 'notes') {
            const onlyFP = interaction.options.getString('filter');
            const top = await getTopRated(onlyFP);
            console.log(`[TOP RATED] with onlyFP: ${onlyFP}`);
            return await interaction.editReply({
                content: `${userMention(userId)}, voici le top demandé !`,
                embeds: [generateTopRatedEmbed(top, onlyFP)],
            });
        }

        return await interaction.editReply({
            content: "Je n'ai pas compris la demande.",
        });
    } catch (error) {
        console.log('error', error);
        throw new Error(`Something Went Wrong, ${error.message}`);
    }
};
