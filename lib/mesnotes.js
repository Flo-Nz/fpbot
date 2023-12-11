import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { apiClient } from './httpClient.js';

export const getUserRatings = async (userId, skip) => {
    const userRatings = await apiClient({
        method: 'get',
        params: { userId, skip },
        url: '/discordorop/ratings',
    });
    const { data } = userRatings;
    return data;
};

export const noMoreRatingsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId('nomorerating')
        .setLabel(`On a fini !`)
        .setDisabled(true)
        .setStyle(ButtonStyle.Secondary)
);

export const nextRatingsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId('nextratings')
        .setLabel('Suivant')
        .setStyle(ButtonStyle.Success)
);

export const previousAndNextRatingsRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('previousratings')
            .setLabel('Précédent')
            .setStyle(ButtonStyle.Success)
    )
    .addComponents(
        new ButtonBuilder()
            .setCustomId('nextratings')
            .setLabel('Suivant')
            .setStyle(ButtonStyle.Success)
    );

export const previousRatingsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId('previousratings')
        .setLabel('Précédent')
        .setStyle(ButtonStyle.Success)
);
