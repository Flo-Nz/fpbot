import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';

// Catch unhandled promise rejections to avoid silent crashes
process.on('unhandledRejection', (error) => {
    console.error('[UNHANDLED REJECTION]', error);
});

// Replicate dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const items = fs.readdirSync(foldersPath);

// Handle root level command files first
const rootCommands = items.filter(item => {
    const itemPath = path.join(foldersPath, item);
    return fs.statSync(itemPath).isFile() && item.endsWith('.js');
});

for (const file of rootCommands) {
    const filePath = path.join(foldersPath, file);
    const command = await import(filePath);
    const { data, execute } = command;
    if (data && execute) {
        client.commands[data.name] = command;
    } else {
        console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

// Handle commands in subdirectories
const folders = items.filter(item => {
    const itemPath = path.join(foldersPath, item);
    return fs.statSync(itemPath).isDirectory();
});

for (const folder of folders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);
        const { data, execute } = command;
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

// Log in to Discord with your client's token
if (process.env.NODE_ENV === 'PROD') {
    client.login(process.env.BOT_TOKEN);
} else {
    client.login(process.env.BOT_DEV_TOKEN);
}
