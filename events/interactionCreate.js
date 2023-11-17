import { Events } from "discord.js";
import { get } from "lodash-es";

export const name = Events.InteractionCreate;
export const execute = async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }
  const command = get(interaction.client.commands, interaction.commandName);
  if (!command) {
    return console.error(
      `No command matching ${interaction.commandName} was found.`
    );
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
};
