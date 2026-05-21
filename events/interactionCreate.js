import { Events, MessageFlags } from "discord.js";

export const name = Events.InteractionCreate;
export const execute = async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }
  const command = interaction.client.commands[interaction.commandName];
  if (!command) {
    return console.error(
      `No command matching ${interaction.commandName} was found.`
    );
  }
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (replyError) {
      console.error('[InteractionCreate] Failed to send error response', replyError.message);
    }
  }
};
