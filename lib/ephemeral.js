export const isEphemeral = (interaction) => {
    if (
        interaction.channelId === '1175621884423966820' ||
        interaction.channelId === '1176664814924333157'
    ) {
        return false;
    }
    return true;
};
