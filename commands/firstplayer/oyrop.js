import { SlashCommandBuilder, bold, userMention } from "discord.js";
import axios from "axios";
import { get, includes, isEmpty } from "lodash-es";
import moment from "moment";

moment.locale("fr");

// Oyrop stands for "On y rejoue ou pas"
export const data = new SlashCommandBuilder()
  .setName("oyrop")
  .setDescription(
    "Demandez-lui s'il existe un épisode de 'On Y Rejoue Ou Pas' !"
  )
  .addStringOption((option) =>
    option
      .setName("titre")
      .setDescription("Titre du jeu à rechercher")
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName("secret")
      .setDescription("`true` pour que la réponse ne soit partagée qu'à vous")
  );

const ytApiUrl = "https://youtube.googleapis.com/youtube/v3/playlistItems";
const playlistId = process.env.FP_OYROP_PLAYLIST_ID;
const key = process.env.YOUTUBE_API_KEY;

const getPlaylist = async (pageToken) => {
  const response = await axios({
    method: "get",
    url: ytApiUrl,
    params: {
      part: "contentDetails,snippet",
      playlistId,
      pageToken,
      key,
    },
  });
  const { data } = response;
  return data;
};

const findOyrop = async (prompt, pageToken) => {
  const oyrop = {};
  const oyropPage = await getPlaylist(pageToken);
  console.log("OYROP PAGE : ", oyropPage);
  for (const item of get(oyropPage, "items")) {
    if (
      includes(item.snippet?.description.toLowerCase(), prompt.toLowerCase())
    ) {
      oyrop.found = true;
      oyrop.date = moment(item.snippet.publishedAt).format("L");
      oyrop.title = item.snippet.title;
      oyrop.thumbnail = item.snippet.thumbnails.medium.url;
      oyrop.url = `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}&list=${playlistId}`;
      return oyrop;
    }
  }
  if (isEmpty(oyrop) && oyropPage.nextPageToken) {
    return findOyrop(prompt, oyropPage.nextPageToken);
  } else {
    oyrop.found = false;
    return oyrop;
  }
};

export const execute = async (interaction) => {
  await interaction.deferReply();
  const { globalName: user, id: userId } = interaction.member.user;
  const title = interaction.options.getString("titre");
  console.log(`Recherche demandée par ${user}. Prompt: `, title);
  console.log("user ID ? ", userId);
  const oyrop = await findOyrop(title);
  if (!oyrop.found) {
    return await interaction.editReply(
      `Désolé ${userMention(
        userId
      )}, je n'ai pas trouvé d'épisode 'On Y Rejoue Ou Pas ?' concernant ${title}! Tu peux toujours demander à Yoël, je ne suis pas infaillible :-)`
    );
  }

  return await interaction.editReply(
    `:partying_face: ${userMention(userId)}, j'ai trouvé un ${bold(
      "On Y Rejoue Ou Pas"
    )} concernant ${bold(title).toUpperCase()} ! Il a été posté le ${bold(
      oyrop.date
    )} et tu peux le visionner ici: ${oyrop.url}`
  );
};
