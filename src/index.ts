import { Client, Intents, Message, TextChannel, MessageEmbed } from 'discord.js';
import { config } from 'dotenv';
import pixivImage from './handlers/pixivImage';
import sensitiveTwitter from './handlers/sensitiveTwitter';
import { sniperInteraction, sniperStoreDelete, sniperStoreEdit, sniperStoreReactionRemove } from './handlers/sniper';

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
  sensitiveTwitter(client, message);
  pixivImage(message);
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
  
  // uuidNickname();
  // setInterval(uuidNickname, 3600000);

  // nukecodeNickname();
  // setInterval(nukecodeNickname, 600000);
}
