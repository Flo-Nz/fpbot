import { bold, inlineCode } from 'discord.js';
import { fpEmojis, testEmojis } from './emojis.js';

const emojisLib = process.env.NODE_ENV === 'PROD' ? fpEmojis : testEmojis;

const generatePrimaryContent = (created, updated) => {
    if (created) {
        return `Tu es le premier à noté ce jeu !\n`;
    }
    if (updated) {
        return `Tu as déjà noté ce jeu petit coquin. Peut-être qu'Alzheimer te guette... Bref, j'ai mis à jour ta note.\n`;
    }
    return '';
};
const generateFpRatingContent = (fpRating) =>
    fpRating ? `La note de Yoël: ${emojisLib[fpRating]}\n` : '';
const generateDiscordRatingContent = (discordRating) =>
    discordRating
        ? `La note moyenne du Discord: ${emojisLib[discordRating]}\n`
        : '';
const generateFpRatingJoke = (fpRating, discordRating) =>
    Math.abs(fpRating - discordRating) >= 2
        ? `Ce qui prouve que Yoël n'a aucun goût, d'ailleurs.\n`
        : '';

export const generateRatingReplyContent = (discordOrop, username, rating) => {
    if (!discordOrop) {
        return ` Pas de problème. Si tu veux noter un autre jeu, fais ${inlineCode(
            '/note titre_du_jeu'
        )}\n Ou cherche un OROP de Yoël avec ${inlineCode(
            '/orop titre_du_jeu'
        )}`;
    }
    const { orop } = discordOrop;
    const primaryContent = generatePrimaryContent(
        discordOrop.created,
        discordOrop.updated
    );
    const fpContent = generateFpRatingContent(orop?.fpOrop?.rating);
    const discordContent = generateDiscordRatingContent(orop?.discordRating);
    const fpRatingJoke = generateFpRatingJoke(
        orop?.fpOrop?.rating,
        orop?.discordRating
    );
    const userRatingJoke = generateRatingJokeContent(username, rating);
    return (
        primaryContent +
        fpContent +
        discordContent +
        fpRatingJoke +
        userRatingJoke
    );
};

const joke12 = (username, rating) => {
    const joke12 = [
        `Méritait-il vraiment ton ${rating} ?`,
        `Et il a pris cher. Tu lui mets un ${rating}. Dur.`,
        `J'espère qu'il ne t'a pas coûté trop cher quand je vois ton ${rating}`,
        `Vraiment ${username} ? Tu lui mets vraiment ${rating} ? OK.`,
        `Oh, un beau candidat à l'Ass d'Or ton ${rating}.`,
        `Merci, ta fabuleuse note ${rating} vient d'être partagée directement à l'auteur, partenaire de FirstPlayer ! Mais non, je déconne. Ou pas.`,
    ];
    return joke12[Math.floor(Math.random() * joke12.length)];
};

const joke3 = (username, rating) => {
    const joke3 = [
        `Inodore, incolore et sans saveur ton ${rating}.`,
        `OK pour ${rating}, ce qui est bien, mais pas top.`,
        `C'est géniallissimement neutre un ${rating}`,
        `Aucune prise de risque avec ton ${rating}, mais bon ça ne m'étonne pas venant de toi ${username}`,
        `Salut je m'appelle ${username} et je suis incapable de trancher, alors je fais le Suisse avec un ${rating}`,
    ];
    return joke3[Math.floor(Math.random() * joke3.length)];
};

const joke4 = (username, rating) => {
    const joke4 = [
        `A rien du top... Mais ton ${rating} c'est déjà très bien.`,
        `C'est donc un beau ${rating} ! Tu y as joué hier et tu t'es un peu emballé non ${username} ? Allez, ça reste entre nous.`,
        `Si t'as hésité avec 3, je te félicite d'avoir finalement choisi ${rating}. Tu évites la réponse de Normand. Mais si t'as hésité avec 5, quel manque de panache, ${username} !`,
        `On apprécie ton ${rating}. D'ailleurs le vert, ça irait mieux pour le 5 non ? Qui est responsable de ce choix de couleurs ? Encore un coup de Yoël. Ou de Séverine.`,
        `Ton ${rating}, il te ressemble. Fais ce que tu veux de cette information.`,
    ];
    return joke4[Math.floor(Math.random() * joke4.length)];
};

const joke5 = (username, rating) => {
    const joke5 = [
        `Wow. ${rating}, carrément ? Joli.`,
        `Et c'est un ${rating} ! Les gens sortent dans la rue, se mettent nus en sortant leurs billets pour acheter le jeu, incroyable, en scandant ${username} ! ${username} ! ${username} !`,
        `Tu fais partie de ceux qui connaissent la réelle valeur de ce jeu avec ton ${rating}. Bienvenue du côté obscur, ${username}.`,
        `Un beau ${rating}, ça met toujours du baume au coeur. Et au portefeuille.`,
        `Je pense qu'avec ton ${rating}, tu devrais lancer un prix genre ${bold(
            `le ${username}'s Spiel`
        )} et lui attribuer directement. Oui je suis un génie.`,
    ];
    return joke5[Math.floor(Math.random() * joke5.length)];
};

export const generateRatingJokeContent = (username, rating) => {
    switch (parseInt(rating)) {
        case 1:
            return joke12(username, emojisLib[rating]);
        case 2:
            return joke12(username, emojisLib[rating]);
        case 3:
            return joke3(username, emojisLib[rating]);
        case 4:
            return joke4(username, emojisLib[rating]);
        case 5:
            return joke5(username, emojisLib[rating]);
        default:
            break;
    }
};
