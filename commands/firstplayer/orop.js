import { SlashCommandBuilder, bold, userMention } from "discord.js";
import axios from "axios";
import { get, includes, isEmpty, invoke } from "lodash-es";
import moment from "moment";

moment.locale("fr");

// Orop stands for "On rejoue ou pas"
export const data = new SlashCommandBuilder()
  .setName("orop")
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
      .setName("public")
      .setDescription("`true` pour que la réponse ne soit partagée à tous")
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

const findTimestamp = (prompt, desc) => {
  // Split when we find the "OO:OO" which is the first chapter
  const firstSplit = desc.toLowerCase().split("00:00");
  // Then split again when we find the prompt
  const secondSplit = firstSplit[1]?.split(prompt.toLowerCase());
  const minutesRegex = /[0-9][0-9]:[0-9][0-9]/;
  // get the timestamps
  const result = invoke(secondSplit[1], "match", minutesRegex);

  // if we got timestamps, the first one should be the one of the prompt. Transform it in seconds and return it.
  if (!isEmpty(result)) {
    return moment.duration(`00:${result[0]}`).asSeconds();
  }
};

const findOrop = async (prompt, pageToken) => {
  const orop = {};
  const oropPage = await getPlaylist(pageToken);
  for (const item of get(oropPage, "items")) {
    if (
      includes(item.snippet?.title.toLowerCase(), prompt.toLowerCase()) ||
      includes(item.snippet?.description.toLowerCase(), prompt.toLowerCase())
    ) {
      orop.found = true;
      orop.date = moment(item.snippet.publishedAt).format("L");
      orop.title = item.snippet.title;
      orop.thumbnail = item.snippet.thumbnails.medium.url;
      const timestamp = findTimestamp(prompt, item.snippet.description);
      if (timestamp) {
        orop.timestamp = timestamp;
      }
      orop.url = `https://www.youtube.com/watch?v=${
        item.snippet.resourceId.videoId
      }&list=${playlistId}${timestamp ? `&t=${timestamp}s` : ""}`;
      return orop;
    }
  }
  if (isEmpty(orop) && oropPage.nextPageToken) {
    return findOrop(prompt, oropPage.nextPageToken);
  } else {
    orop.found = false;
    return orop;
  }
};

export const execute = async (interaction) => {
  const isEphemeral =
    (interaction.guildId !== "933486333756846101" &&
      interaction.channelId !== "1175621884423966820") ||
    !interaction.options.getBoolean("public");
  await interaction.deferReply({ ephemeral: isEphemeral });
  const { globalName: user, id: userId } = interaction.member.user;
  const title = interaction.options.getString("titre");

  console.log(`Recherche demandée par ${user}. Prompt: `, title);
  const orop = await findOrop(title);
  console.log(`Orop trouvé ? ${orop.found ? "Yes" : "No"}`);
  if (!orop.found) {
    return await interaction.editReply({
      content: `Désolé ${userMention(
        userId
      )}, je n'ai pas trouvé d'épisode ${bold(
        "On Rejoue Ou Pas ?"
      )} concernant ${title}! Tu peux toujours demander à Yoël, je ne suis pas infaillible :smile:`,
    });
  }

  return await interaction.editReply({
    content: `:partying_face: ${userMention(userId)}, j'ai trouvé un ${bold(
      "On Rejoue Ou Pas"
    )} concernant ${bold(title).toUpperCase()} ! Il a été posté le ${bold(
      orop.date
    )} et tu peux le visionner ici: ${orop.url}`,
  });
};
