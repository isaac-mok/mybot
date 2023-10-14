import { Client, Intents } from 'discord.js';
import { config } from 'dotenv';
import pixivImage from './handlers/pixivImage';
import { sniperInteraction, sniperStoreDelete, sniperStoreEdit, sniperStoreReactionRemove } from './handlers/sniper';
import twitterLink from './handlers/twitterLink';

config();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
	partials: ["MESSAGE", "REACTION", "USER"],
});

client.on('ready', () => {
  console.log('Logged in.');
});

client.on('messageCreate', (message) => {
  pixivImage(message);
  twitterLink(message);
});

client.on("messageDelete", async (message) => {
  sniperStoreDelete(message);
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
  sniperStoreEdit(oldMessage, newMessage);
});

client.on('messageReactionRemove', async (reaction, user) => {
  sniperStoreReactionRemove(reaction, user);
});

client.on('interactionCreate', async (interaction) => {
  sniperInteraction(client, interaction);
});

const token = process.env.DISCORD_TOKEN;

if (typeof token === 'undefined') throw 'Token not set in .env';

start();

async function start() {
  await client.login(token);
}
