/**
 * Date utilities replacing moment.js with native Intl APIs.
 */

const fullFormatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

const shortFormatter = new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

/**
 * Equivalent to moment().format('LLLL') in French locale.
 * Example: "vendredi 13 juin 2025 à 14:30"
 */
export const formatFullDate = (date = new Date()) => fullFormatter.format(date);

/**
 * Equivalent to moment(date).format('L') in French locale.
 * Example: "13/06/2025"
 */
export const formatShortDate = (date) => shortFormatter.format(new Date(date));

/**
 * Converts a "MM:SS" string to total seconds.
 * Equivalent to moment.duration('00:MM:SS').asSeconds()
 */
export const durationToSeconds = (mmss) => {
    const [minutes, seconds] = mmss.split(':').map(Number);
    return minutes * 60 + seconds;
};
