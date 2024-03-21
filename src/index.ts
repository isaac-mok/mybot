import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { config } from 'dotenv';
import { sniperInteraction, sniperStoreDelete, sniperStoreEdit, sniperStoreReactionRemove } from './handlers/sniper';
import twitterLink from './handlers/twitterLink';
import pixivLink from './handlers/pixivLink';
import redditLink from './handlers/redditLink';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
	partials: [Partials.Message, Partials.Reaction, Partials.User],
});

client.on('ready', () => {
  console.log('Logged in.');
});

client.on('messageCreate', (message) => {
  pixivLink(message);
  twitterLink(message);
  redditLink(message);
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
