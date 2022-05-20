import { Client, Intents } from 'discord.js';
import { config } from 'dotenv';
import { generate } from 'short-uuid';

config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.on('ready', () => {
  console.log('Logged in.');
});

const token = process.env.DISCORD_TOKEN;

if (typeof token === 'undefined') throw 'Token not set in .env';

start();

async function start() {
  await client.login(token);
  
  uuidNickname();
  setInterval(uuidNickname, 3600000);
}
  
function uuidNickname() {
  const uuidMap = process.env.UUID_MAP;

  if (typeof uuidMap === 'undefined') throw 'UUID map not set in .env';

  const uuidMapJson = JSON.parse(uuidMap) as Record<string, string[]>;

  Object.keys(uuidMapJson).forEach(async guildId => {
    const guild = await client.guilds.fetch(guildId);

    uuidMapJson[guildId].forEach(async userId => {
      const member = await guild.members.fetch(userId);

      member.setNickname(generate());
    });
  });
}
