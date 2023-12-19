import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { fpEmojis, testEmojis } from './emojis.js';
import { apiClient } from './httpClient.js';

const rating1Button = new ButtonBuilder()
    .setCustomId('1')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji(process.env.NODE_ENV !== 'PROD' ? testEmojis[1] : fpEmojis[1]);

const rating2Button = new ButtonBuilder()
    .setCustomId('2')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji(process.env.NODE_ENV !== 'PROD' ? testEmojis[2] : fpEmojis[2]);

const rating3Button = new ButtonBuilder()
    .setCustomId('3')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji(process.env.NODE_ENV !== 'PROD' ? testEmojis[3] : fpEmojis[3]);

const rating4Button = new ButtonBuilder()
    .setCustomId('4')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji(process.env.NODE_ENV !== 'PROD' ? testEmojis[4] : fpEmojis[4]);

const rating5Button = new ButtonBuilder()
    .setCustomId('5')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji(process.env.NODE_ENV !== 'PROD' ? testEmojis[5] : fpEmojis[5]);

const notYetButton = new ButtonBuilder()
    .setCustomId('notyet')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('🚫')
    .setLabel('Annuler');

export const generateTextRatingButton = (end) => {
    const oropTextRatingButton = new ButtonBuilder()
        .setCustomId('textrating')
        .setStyle(ButtonStyle.Success)
        .setLabel(end ? `Je suis passé à autre chose` : `Toi aussi, note-le !`)
        .setDisabled(true);
    return new ActionRowBuilder().addComponents(oropTextRatingButton);
};

export const ratingsRow = new ActionRowBuilder().addComponents(
    rating1Button,
    rating2Button,
    rating3Button
);
export const notYetRow = new ActionRowBuilder().addComponents(
    rating4Button,
    rating5Button,
    notYetButton
);

export const ratingsRow2 = new ActionRowBuilder().addComponents(
    rating4Button,
    rating5Button
);

export const generateRatingResponseRow = (rating, username) => {
    if (rating === 'notyet') {
        const notYetRow = new ButtonBuilder()
            .setCustomId('notyetresponse')
            .setLabel(`${username}, pour le noter fais /note titre`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);
        return [new ActionRowBuilder().addComponents(notYetRow)];
    }
    if (rating === 'endoftime') {
        const eotRow = new ButtonBuilder()
            .setCustomId('eot')
            .setLabel(`${username}, utilise /note pour le noter !`)
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary);
        return [new ActionRowBuilder().addComponents(eotRow)];
    }
    const ratingResponseRow = new ButtonBuilder()
        .setCustomId('ratingresponse')
        .setLabel("Merci d'avoir noté ce jeu !")
        .setDisabled(true)
        .setEmoji(
            process.env.NODE_ENV === 'PROD'
                ? fpEmojis[rating]
                : testEmojis[rating]
        )
        .setStyle(ButtonStyle.Secondary);
    return [new ActionRowBuilder().addComponents(ratingResponseRow)];
};

export const postRating = async (title, rating, skipSearchInc) => {
    try {
        const response = await apiClient({
            method: 'post',
            url: '/discordorop',
            data: { skipSearchInc, title, ...rating },
        });
        const { data } = response;
        return data;
    } catch (error) {
        return;
    }
};

export const postFpRating = async (title, rating) => {
    try {
        const response = await apiClient({
            method: 'post',
            url: '/fporop/rating',
            data: { title, rating },
        });
        const { data } = response;
        return data;
    } catch (error) {
        return;
    }
};
