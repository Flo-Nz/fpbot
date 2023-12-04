import { upperCase } from 'lodash-es';
import { generateRatingJokeContent } from './textContent.js';
import { EmbedBuilder, bold, userMention } from 'discord.js';
import { ratingChannelId, emojisLib } from './utils.js';

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

export const postRatingEmbed = async ({
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

    return interaction.guild.channels.cache.get(ratingChannelId).send({
        content: generateRatingJokeContent(userId, rating),
        embeds: [embedMessage],
    });
};
