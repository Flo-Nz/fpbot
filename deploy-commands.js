import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const env = process.env.NODE_ENV;

const clientId =
    env === 'PROD' ? process.env.CLIENT_ID : process.env.CLIENT_DEV_ID;
const token =
    env === 'PROD' ? process.env.BOT_TOKEN : process.env.BOT_DEV_TOKEN;
// Replicate dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.js'));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        const { data, execute } = command;
        if (data && execute) {
            commands.push(command.data.toJSON());
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        const data = await rest.put(Routes.applicationCommands(clientId), {
            body: commands,
        });

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
