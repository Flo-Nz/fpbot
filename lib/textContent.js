import { bold, hyperlink, userMention } from 'discord.js';
import { fpEmojis, testEmojis } from './emojis.js';

const emojisLib = process.env.NODE_ENV === 'PROD' ? fpEmojis : testEmojis;

const joke12 = (userId, rating) => {
    const joke12 = [
        `${userMention(userId)}, méritait-il vraiment ton ${rating} ?`,
        `Et il a pris cher. Merci ${userMention(userId)}. Dur.`,
        `${userMention(
            userId
        )}, j'espère qu'il ne t'a pas coûté trop cher quand je vois ton ${rating}`,
        `Vraiment ${userMention(userId)}? Il fait un peu mal ce ${rating}`,
        `Oh, un beau candidat à l'Ass d'Or ton ${rating}, ${userMention(
            userId
        )}.`,
        `Merci ${userMention(
            userId
        )}, ta fabuleuse note ${rating} vient d'être partagée directement à l'auteur, partenaire de FirstPlayer ! Mais non, je déconne. Ou pas.`,
    ];
    return joke12[Math.floor(Math.random() * joke12.length)];
};

const joke3 = (userId, rating) => {
    const joke3 = [
        `Inodore, incolore et sans saveur ton ${rating}, ${userMention(
            userId
        )}.`,
        `${rating}, ce qui est bien, mais pas top, ${userMention(userId)}`,
        `C'est géniallissimement neutre un ${rating}, ${userMention(userId)}`,
        `Aucune prise de risque avec ton ${rating}, mais bon ça ne m'étonne pas venant de toi ${userMention(
            userId
        )}`,
        `Salut je m'appelle ${userMention(
            userId
        )} et je suis incapable de trancher, alors je fais le Suisse avec un ${rating}`,
    ];
    return joke3[Math.floor(Math.random() * joke3.length)];
};

const joke4 = (userId, rating) => {
    const joke4 = [
        `${userMention(
            userId
        )}, tu voulais pas lui mettre le top? T'as choisi ${rating}? Radin.`,
        `C'est donc un beau ${rating} ! Tu y as joué hier et tu t'es un peu emballé non ${userMention(
            userId
        )} ? Allez, ça reste entre nous.`,
        `Si t'as hésité avec 3, je te félicite d'avoir finalement choisi ${rating}. Tu évites la réponse de Normand. Mais si t'as hésité avec 5, quel manque de panache, ${userMention(
            userId
        )} !`,
        `On apprécie ton ${rating}; ${userMention(
            userId
        )}. D'ailleurs le vert, ça irait mieux pour le 5 non ? Qui est responsable de ce choix de couleurs ? Encore un coup de Yoël (Séverine a démenti)`,
        `Ton ${rating}, il te ressemble, ${userMention(
            userId
        )}. Fais ce que tu veux de cette information.`,
    ];
    return joke4[Math.floor(Math.random() * joke4.length)];
};

const joke5 = (userId, rating) => {
    const joke5 = [
        `ALERTE ! ${userMention(userId)} vient de mettre un ${rating} !`,
        `Et c'est un ${rating} ! Les gens sortent dans la rue, se mettent nus en sortant leurs billets pour acheter le jeu, incroyable, en scandant ${userMention(
            userId
        )} ! ${userMention(userId)} ! ${userMention(userId)} !`,
        `La communauté te remercie de ce ${rating}. Tu es désormais membre de notre confrérie des joueurs de jeux exceptionnels, bienvenue ${userMention(
            userId
        )}.`,
        `Un beau ${rating}, ça met toujours du baume au coeur. Et au portefeuille, n'est-ce pas ${userMention(
            userId
        )}?`,
        `Je pense qu'avec ton ${rating}, tu devrais lancer un prix genre ${bold(
            `Le ${userMention(userId)} d'Or`
        )} et lui attribuer directement. Oui je suis un génie.`,
        `Au moins un qui ne restera pas dans ta pile de la honte, ${userMention(
            userId
        )}. Pas avec ${rating}, tu ne ferais pas ça.`,
    ];
    return joke5[Math.floor(Math.random() * joke5.length)];
};

export const generateRatingJokeContent = (userId, rating) => {
    switch (parseInt(rating)) {
        case 1:
            return joke12(userId, emojisLib[rating]);
        case 2:
            return joke12(userId, emojisLib[rating]);
        case 3:
            return joke3(userId, emojisLib[rating]);
        case 4:
            return joke4(userId, emojisLib[rating]);
        case 5:
            return joke5(userId, emojisLib[rating]);
        default:
            break;
    }
};

const generateOropPrimaryContent = (title, orop, userId) => {
    if (!orop) {
        return `Je n'ai pas trouvé d'OROP !`;
    }
    const { publishedDate, youtubeUrl } = orop;
    return `:partying_face: ${userMention(userId)}, j'ai trouvé un ${bold(
        'On Rejoue Ou Pas'
    )} concernant ${bold(title).toUpperCase()} !\n Il a été posté le ${bold(
        publishedDate
    )} et tu peux le visionner sur ${hyperlink('Youtube', youtubeUrl)}\n`;
};

const generateOropRatingContent = (orop) => {
    if (!orop) {
        return `Ce jeu n'a pas été trouvé en base !`;
    }
    const { rating, discordRating, searchCount } = orop;
    let content;
    content = rating ? `Yoël l'a noté ${emojisLib[rating]}. ` : '';
    if (discordRating) {
        content =
            content +
            `La moyenne du Discord est de ${emojisLib[discordRating]} (Noté ${orop.discordOrop?.ratings?.length} fois)\n`;
    }
    return `${content} Le jeu a été recherché ${searchCount || 1} fois.`;
};

export const generateOropContent = (title, orop, userId) => {
    const primaryContent = generateOropPrimaryContent(
        title,
        orop.fpOrop,
        userId
    );
    const ratingContent = generateOropRatingContent(orop);

    return primaryContent + ratingContent;
};
