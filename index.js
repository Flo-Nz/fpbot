import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Require the necessary discord.js classes
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

// Replicate dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        const { data, execute } = command;
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if (data && execute) {
            client.commands[data.name] = command;
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = await import(filePath);
    const { once, name, execute } = event;
    if (once) {
        client.once(name, (...args) => execute(...args));
    } else {
        client.on(name, (...args) => execute(...args));
    }
}

console.log('PROCESS ENV ENVIRONMENT', process.env.ENVIRONMENT);

// Log in to Discord with your client's token
if (process.env.NODE_ENV === 'PROD') {
    client.login(process.env.BOT_TOKEN);
} else {
    client.login(process.env.BOT_DEV_TOKEN);
}
