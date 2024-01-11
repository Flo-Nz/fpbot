import { find, upperCase } from 'lodash-es';
import { generateRatingJokeContent } from './textContent.js';
import {
    ComponentType,
    EmbedBuilder,
    bold,
    hyperlink,
    inlineCode,
    userMention,
} from 'discord.js';
import { ratingChannelId, emojisLib, isProd } from './utils.js';
import moment from 'moment';
import {
    postFpRating,
    postRating,
    ratingsRow,
    ratingsRow2,
} from './ratings.js';
import { getOneOrop } from './cronTasks.js';

moment.locale('fr');

const assets = {
    1: {
        color: '#FF242A',
        thumbnail:
            'https://cdn.discordapp.com/emojis/1084760502695108628.webp?size=44&quality=lossless',
    },
    2: {
        color: '#F37331',
        thumbnail:
            'https://cdn.discordapp.com/emojis/1084760544852062258.webp?size=44&quality=lossless',
    },
    3: {
        color: '#FFDE29',
        thumbnail:
            'https://cdn.discordapp.com/emojis/1084760546999549962.webp?size=44&quality=lossless',
    },
    4: {
        color: '#30E070',
        thumbnail:
            'https://cdn.discordapp.com/emojis/1084760547788066817.webp?size=44&quality=lossless',
    },
    5: {
        color: '#314DF3',
        thumbnail:
            'https://cdn.discordapp.com/emojis/1084760549432234004.webp?size=44&quality=lossless',
    },
};

const generateNoteEmbedMessage = ({
    interaction,
    title,
    userId,
    orop,
    rating,
    created,
    updated,
}) => {
    if (!interaction || !title || !userId || !orop || !rating) {
        return interaction.guild.channels.cache
            .get(ratingChannelId)
            .send(`Missing something`);
    }

    // Fields handler
    const fields = [];
    const fpRating = orop.fpOrop?.rating;
    const { discordRating } = orop;
    const discordRatings = orop.discordOrop?.ratings;

    if (fpRating) {
        fields.push(
            {
                name: bold(`Yoël (FirstPlayer)`),
                value: emojisLib[fpRating],
                inline: true,
            },
            { name: '\u200B', value: '\u200B', inline: true }
        );
    }
    if (discordRating && discordRatings) {
        fields.push({
            name: `${bold(`Moyenne Discord`)} - Noté ${
                discordRatings.length
            } fois`,
            value: emojisLib[discordRating],
            inline: true,
        });
    }
    if (Math.abs(fpRating - discordRating) >= 2) {
        fields.push({
            name: `Ce qui montre d'ailleurs qu'il n'a aucun goût`,
            value: '\u200B',
        });
    }
    let description = `${userMention(userId)} vient de noter ce jeu !`;
    if (created) {
        description = `${userMention(userId)} est le premier à noter ce jeu !`;
    }
    if (updated) {
        description = `${userMention(userId)} a mis à jour sa note`;
    }
    const embedMessage = new EmbedBuilder()
        .setColor(assets[rating].color)
        .setTitle(upperCase(title))
        .setDescription(description)
        .setThumbnail(assets[rating].thumbnail)
        .addFields(fields)
        .setFooter({
            text: `Jeu recherché ${orop.searchCount} fois par la communauté`,
        });
    return embedMessage;
};

export const postRatingEmbed = async ({
    interaction,
    title,
    userId,
    orop,
    rating,
    created,
    updated,
}) => {
    const response = await interaction.guild.channels.cache
        .get(ratingChannelId)
        .send({
            content: generateRatingJokeContent(userId, rating),
            embeds: [
                generateNoteEmbedMessage({
                    interaction,
                    title,
                    userId,
                    orop,
                    rating,
                    created,
                    updated,
                }),
            ],
            components: [ratingsRow, ratingsRow2],
        });

    const collector = await response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: isProd ? 3600000 : 60000,
    });
    collector.on('collect', async (interact) => {
        const { customId } = interact;
        interact.deferUpdate();
        const isFpRating = interact.user.id === '250942701267058688';
        let newRating;
        if (isFpRating) {
            newRating = await postFpRating(title, customId);
        } else {
            newRating = await postRating(
                title,
                {
                    userId: interact.user.id,
                    rating: customId,
                },
                true
            );
        }
        console.log('[NOTE] Noté', {
            username: interact.user.username,
            title: title,
            rating: customId,
        });
        response.edit({
            content: generateRatingJokeContent(interact.user.id, customId),
            embeds: [
                generateNoteEmbedMessage({
                    interaction,
                    title,
                    userId: interact.user.id,
                    orop: isFpRating ? newRating : newRating?.orop,
                    rating: customId,
                    created: newRating?.created,
                    updated: newRating?.updated,
                }),
            ],
            components: [ratingsRow, ratingsRow2],
        });
    });

    collector.on('end', async () => {
        const lastOrop = await getOneOrop(title, true);
        const firstUserRating = find(
            lastOrop?.discordOrop?.ratings,
            (elem) => elem.userId === interaction.user.id
        )?.rating;
        response.edit({
            content: `Ce jeu ne peut plus être noté pour le moment. Utilise ${inlineCode(
                '/note'
            )} pour le noter de nouveau !`,
            embeds: [
                generateNoteEmbedMessage({
                    interaction,
                    title,
                    userId: interaction.user.id,
                    orop: lastOrop,
                    rating: firstUserRating,
                    created: created,
                    updated: updated,
                }),
            ],
            components: [],
        });
    });
};

export const generateTopSearchedEmbed = (top, withVideo) => {
    const fields = [];
    let position = 1;
    for (const boardgame of top) {
        const { fpOrop } = boardgame;
        const game = {
            name: `${position}- ${upperCase(boardgame.title[0])}`,
            value: fpOrop?.youtubeUrl
                ? `${boardgame.searchCount} recherches - ${hyperlink(
                      'Youtube',
                      fpOrop.youtubeUrl
                  )}`
                : `${boardgame.searchCount} recherches`,
            inline: true,
        };
        position++;
        fields.push(game);
    }

    const embedMessage = new EmbedBuilder()
        .setColor('#825ed1')
        .setTitle(
            upperCase(
                withVideo
                    ? 'Top 10 des recherches OROP de Yoël'
                    : 'Top 10 des recherches Discord'
            )
        )
        .setDescription(
            withVideo
                ? 'Les OROP les plus recherchés de Yoël'
                : 'Les jeux les plus recherchés par la communauté Discord'
        )
        .setThumbnail(
            'https://img.icons8.com/?size=256&id=nEaCzRRWyzwN&format=png'
        )
        .addFields(fields)
        .setFooter({
            text: `Ce top a été généré le ${moment().format('LLLL')}`,
        });

    return embedMessage;
};

export const generateTopRatedEmbed = (top, onlyFP) => {
    const fields = [];
    let position = 1;
    if (onlyFP === 'firstplayer') {
        for (const boardgame of top) {
            const { fpOrop } = boardgame;
            const { rating, youtubeUrl } = fpOrop;
            const { discordRating } = boardgame;

            const game = {
                name: `${position}- ${upperCase(boardgame.title[0])} ${
                    emojisLib[rating]
                }`,
                value: `${
                    discordRating
                        ? `Discord:${emojisLib[discordRating]}(noté ${boardgame.discordOrop.ratings.length}x)`
                        : ''
                }
                ${youtubeUrl ? hyperlink('Youtube', youtubeUrl) : ''}`,
                inline: true,
            };
            position++;
            fields.push(game);
        }
    } else {
        for (const boardgame of top) {
            const { discordOrop } = boardgame;
            const { discordRating } = boardgame;

            const game = {
                name: `${position}- ${upperCase(boardgame.title[0])} ${
                    emojisLib[discordRating]
                } (${discordOrop.ratings.length} notes)`,
                value: `${
                    boardgame.fpOrop?.rating
                        ? `Yoël:${emojisLib[boardgame.fpOrop?.rating]}`
                        : ''
                } ${
                    boardgame.fpOrop?.youtubeUrl
                        ? hyperlink('Youtube', boardgame.fpOrop?.youtubeUrl)
                        : ''
                }`,
                inline: true,
            };
            position++;
            fields.push(game);
        }
    }
    const embedMessage = new EmbedBuilder()
        .setColor('#825ed1')
        .setTitle(
            upperCase(
                onlyFP === 'firstplayer'
                    ? 'Top 10 des notes de Yoël'
                    : 'Top 10 des notes Discord'
            )
        )
        .setDescription(
            onlyFP === 'firstplayer'
                ? 'Les jeux les mieux notés par Yoël'
                : 'Les jeux les mieux notés par la communauté Discord'
        )
        .setThumbnail(
            'https://img.icons8.com/?size=256&id=M6eODCPfnYr9&format=png'
        )
        .addFields(fields)
        .setFooter({
            text: `Ce top a été généré le ${moment().format('LLLL')}`,
        });

    return embedMessage;
};

export const generateUserRatingsEmbed = (fields) => [
    new EmbedBuilder()
        .addFields(fields)
        .setColor('#f348dc')
        .setTitle('Mes notes')
        .setThumbnail('https://img.icons8.com/?size=256&id=42824&format=png')
        .setFooter({
            text: `${fields.length} résultats, générés le ${moment().format(
                'LLLL'
            )}`,
        }),
];

export const generateGameInfos = (orop, userId) => {
    const { fpOrop, discordOrop, discordRating, searchCount } = orop;

    const fields = [];
    // Handle case of existing fpOrop
    if (fpOrop?.rating) {
        fields.push({
            name: 'Note Yoël',
            value: emojisLib[fpOrop?.rating],
            inline: true,
        });
    }
    if (discordRating) {
        fields.push({
            name: 'Moy. Discord',
            value: `${emojisLib[discordRating]}(${discordOrop.ratings?.length} notes)`,
            inline: true,
        });
    }
    if (searchCount) {
        fields.push({
            name: 'Nb Recherches',
            value: searchCount.toString(),
            inline: true,
        });
    }
    if (userId && find(discordOrop.ratings, (elem) => elem.userId === userId)) {
        const userRating = find(
            discordOrop.ratings,
            (elem) => elem.userId === userId
        );
        fields.push({
            name: 'Ma note',
            value: emojisLib[userRating?.rating],
            inline: true,
        });
    }
    if (fpOrop?.youtubeUrl) {
        fields.push({
            name: 'OROP',
            value: hyperlink('Youtube', fpOrop.youtubeUrl),
        });
    }

    const embed = new EmbedBuilder()
        .addFields(fields)
        .setColor('#ffb600')
        .setTitle(upperCase(orop.title[0]))
        .setThumbnail(
            'https://img.icons8.com/?size=256&id=rhEyFGuPqTV7&format=png'
        )
        .setFooter({
            text: `généré le ${moment().format('LLLL')}`,
        });
    return embed;
};
