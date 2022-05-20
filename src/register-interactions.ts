import { REST } from '@discordjs/rest';
import { config } from 'dotenv';
import { RESTPostAPIApplicationCommandsJSONBody, Routes, ApplicationCommandType } from 'discord-api-types/v10';

config();

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

const token = process.env.DISCORD_TOKEN as string;
const appId = process.env.DISCORD_APP_ID as string;

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(appId),
      { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
