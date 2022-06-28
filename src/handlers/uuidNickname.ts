import { Client } from "discord.js";
import { generate } from 'short-uuid';

export default function uuidNickname(client: Client<boolean>) {
  const uuidMap = process.env.UUID_MAP;

  if (typeof uuidMap === 'undefined') throw 'UUID map not set in .env or dotenv not configured.';

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
