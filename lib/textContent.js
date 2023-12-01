import { fpEmojis, testEmojis } from './emojis.js';

const joke12 = (username, rating) => {
    const joke12 = [
        `Méritait-il vraiment ce ${rating} ?`,
        `Et il a pris cher. ${rating}`,
        `J'espère qu'il ne t'a pas coûté trop cher quand je vois ce ${rating}`,
        `Vraiment ${username} ? Tu lui mets vraiment ${rating} ? OK.`,
        `Merci, ta fabuleuse note ${rating} vient d'être partagée directement à l'auteur, partenaire de FirstPlayer ! Mais non, je déconne. Ou pas.`,
    ];
    return joke12[Math.floor(Math.random() * joke12.length)];
};

const joke3 = (username, rating) => {
    const joke3 = [
        `Inodore, incolore et sans saveur ce ${rating}.`,
        `OK pour ${rating}, ce qui est bien, mais pas top.`,
        `C'est géniallissimement neutre un ${rating}`,
        `Aucune prise de risque avec ton ${rating}, mais bon ça ne m'étonne pas venant de toi ${username}`,
        `Salut je m'appelle ${username} et je suis incapable de trancher, alors je fais le Suisse avec un ${rating}`,
    ];
    return joke3[Math.floor(Math.random() * joke3.length)];
};

const joke45 = (username, rating) => {
    const joke45 = [
        `Wow. ${rating}, carrément ? Joli.`,
        `Et c'est un ${rating} ! Les gens sortent dans la rue, se mettent nus en sortant leurs billets pour acheter le jeu, incroyable, en scandant ${username} ! ${username} ! ${username} !`,
        `Tu fais partie de ceux qui connaissent la réelle valeur de ce jeu avec ce ${rating}. Bienvenue du côté obscur, ${username}.`,
        `Un beau ${rating}, ça met toujours du baume au coeur. Et au portefeuille.`,
        `Je pense qu'avec ce ${rating}, tu devrais lancer un prix genre le spiel de ${username} et lui attribuer directement. Oui je suis un génie.`,
    ];
    return joke45[Math.floor(Math.random() * joke45.length)];
};

export const generateRatingJokeContent = (username, rating) => {
    const emojisLib = process.env.NODE_ENV === 'PROD' ? fpEmojis : testEmojis;
    switch (parseInt(rating)) {
        case 1:
            return joke12(username, emojisLib[rating]);
        case 2:
            return joke12(username, emojisLib[rating]);
        case 3:
            return joke3(username, emojisLib[rating]);
        case 4:
            return joke45(username, emojisLib[rating]);
        case 5:
            return joke45(username, emojisLib[rating]);
        default:
            break;
    }
};
