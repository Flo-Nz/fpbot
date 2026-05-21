import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche la liste des commandes disponibles');

export const execute = async (interaction) => {
    try {
        const commandsPath = path.dirname(__dirname);
        const folders = fs
            .readdirSync(commandsPath)
            .filter((item) =>
                fs.statSync(path.join(commandsPath, item)).isDirectory()
            );

        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Liste des commandes disponibles')
            .setDescription(
                'Voici toutes les commandes que vous pouvez utiliser:'
            );

        // Handle commands in folders
        for (const folder of folders) {
            const folderPath = path.join(commandsPath, folder);
            const commandFiles = fs
                .readdirSync(folderPath)
                .filter((file) => file.endsWith('.js'));

            let folderCommands = [];

            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = await import(filePath);
                if (command.data) {
                    folderCommands.push({
                        name: command.data.name,
                        description: command.data.description,
                        options: command.data.options ?? [],
                    });
                }
            }

            if (folderCommands.length > 0) {
                let commandList = '';
                folderCommands.forEach((cmd) => {
                    commandList += `**/${cmd.name}** - ${cmd.description}\n`;
                    if (cmd.options.length > 0) {
                        cmd.options.forEach((opt) => {
                            commandList += `  • \`${opt.name}\`: ${
                                opt.description
                            }${opt.required ? ' (Requis)' : ''}\n`;
                        });
                    }
                });
                helpEmbed.addFields({
                    name: `📎 ${
                        folder.charAt(0).toUpperCase() + folder.slice(1)
                    }`,
                    value: commandList,
                });
            }
        }

        return interaction.reply({ embeds: [helpEmbed], flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error(error);
        return interaction.reply({
            content: "Une erreur est survenue lors de l'affichage de l'aide.",
            flags: MessageFlags.Ephemeral,
        });
    }
};
