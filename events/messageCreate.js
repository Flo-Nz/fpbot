export const name = 'messageCreate';
export const once = false;
export const execute = async (message) => {
    if (
        message.channel.id === process.env.OROP_NOTE_CHANNEL_ID &&
        !message.content.startsWith('/') &&
        !message.author.bot
    ) {
        await message.delete();
    }
};
