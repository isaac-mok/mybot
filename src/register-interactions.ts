import { REST } from '@discordjs/rest';
import { config } from 'dotenv';
import { RESTPostAPIApplicationCommandsJSONBody, Routes, ApplicationCommandType, ApplicationCommandOptionType } from 'discord-api-types/v10';

config();

const guild = process.argv[2];

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
  {
		name: "snipe",
		description: "Shows the last deleted message from a specified channel!",
		options: [
			{
				type: 6, // user
				name: "target",
				description: "The user to snipe",
			},
			{
				type: 7, // text channel
				name: "channel",
				description: "The channel to snipe",
			},
			{
				type: ApplicationCommandOptionType.Integer,
				name: "history",
				description: "How far back in history (0 = latest, max: 4)",
				max_value: 4,
				min_value: 0,
			},
		],
	},
	{
		name: "editsnipe",
		description: "Shows the last edited message from a specified channel!",
		options: [
			{
				type: 6, // user
				name: "target",
				description: "The user to snipe",
			},
			{
				type: 7, // text channel
				name: "channel",
				description: "The channel to snipe",
			},
			{
				type: ApplicationCommandOptionType.Integer,
				name: "history",
				description: "How far back in history (0 = latest, max: 4)",
				max_value: 4,
				min_value: 0,
			},
		],
	},
	{
		name: "reactionsnipe",
		description:
			"Shows the last removed reaction from a specified channel!",
		options: [
			{
				type: 6, // user
				name: "target",
				description: "The user to snipe",
			},
			{
				type: 7, // text channel
				name: "channel",
				description: "The channel to snipe",
			},
			{
				type: ApplicationCommandOptionType.Integer,
				name: "history",
				description: "How far back in history (0 = latest, max: 4)",
				max_value: 4,
				min_value: 0,
			},
		],
	},
];

const token = process.env.DISCORD_TOKEN as string;
const appId = process.env.DISCORD_APP_ID as string;

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      guild
        ? Routes.applicationGuildCommands(appId, guild)
        : Routes.applicationCommands(appId),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
