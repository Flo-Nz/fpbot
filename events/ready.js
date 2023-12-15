import { Events } from 'discord.js';
import cron from 'node-cron';
import { isProd } from '../lib/utils.js';
import { oneDayOneGame } from '../lib/cronTasks.js';
export const name = Events.ClientReady;
export const once = true;

const oneDayOneGameSchedule = isProd ? '0 9 * * *' : '* * * * *';

export const execute = async (client) => {
    try {
        console.log(`Ready ! Logged in as ${client.user.tag}`);
        const oneDayOneGameCron = cron.schedule(oneDayOneGameSchedule, () =>
            oneDayOneGame(client)
        );
        oneDayOneGameCron.start();
    } catch (error) {
        console.log('Ready Event - error ', error);
    }
};
