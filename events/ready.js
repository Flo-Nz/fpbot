import { Events } from 'discord.js';
import cron from 'node-cron';
import { isProd } from '../lib/utils.js';
import { oneDayOneGame } from '../lib/cronTasks.js';
export const name = Events.ClientReady;
export const once = true;

const oneDayOneGameSchedule = isProd
    ? process.env.UN_JOUR_UN_JEU_CRON
    : process.env.UN_JOUR_UN_JEU_CRON_DEV;

export const execute = async (client) => {
    try {
        console.log(`Ready ! Logged in as ${client.user.tag}`);
        cron.schedule(oneDayOneGameSchedule, () => oneDayOneGame(client));
    } catch (error) {
        console.log('Ready Event - error ', error);
    }
};
