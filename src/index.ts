import { Client, Intents } from 'discord.js';
import { config } from 'dotenv';
import { generate } from 'short-uuid';
import axios from 'axios';

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

  nukecodeNickname();
  setInterval(nukecodeNickname, 600000);
}
  
function uuidNickname() {
  const uuidMap = process.env.UUID_MAP;

  if (typeof uuidMap === 'undefined') throw 'UUID map not set in .env';

  const uuidMapJson = JSON.parse(uuidMap) as Record<string, string[]>;

  Object.keys(uuidMapJson).forEach(async guildId => {
    try {
      const guild = await client.guilds.fetch(guildId);
  
      uuidMapJson[guildId].forEach(async userId => {
        const member = await guild.members.fetch(userId);
  
        member.setNickname(generate());
      });
    } catch (error) {
      console.error(error);
    }
  });
}

async function nukecodeNickname() {
  const nukecodeMap = process.env.NUKECODE_MAP;

  if (typeof nukecodeMap === 'undefined') throw 'Nukecode map not set in .env';

  const nukecodeMapJson = JSON.parse(nukecodeMap) as Record<string, string[]>;

  try {
    const response = await axios.get('https://nhentai.net');

    const code = Array.from((response.data as string).matchAll(new RegExp(/\/g\/\d+/g)))[5][0];

    Object.keys(nukecodeMapJson).forEach(async guildId => {
      try {
        const guild = await client.guilds.fetch(guildId);
    
        nukecodeMapJson[guildId].forEach(async userId => {
          const member = await guild.members.fetch(userId);
    
          member.setNickname(code);
        });
      } catch (error) {
        console.error(error);
      }
    });
  } catch (error) {
    console.error(error);
  }
}
