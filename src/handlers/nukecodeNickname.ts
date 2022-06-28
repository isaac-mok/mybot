import { Client } from "discord.js";
import axios from 'axios';

export default async function nukecodeNickname(client: Client<boolean>, code?: number) {
  const nukecodeMap = process.env.NUKECODE_MAP;

  if (typeof nukecodeMap === 'undefined') throw 'Nukecode map not set in .env';

  const nukecodeMapJson = JSON.parse(nukecodeMap) as Record<string, string[]>;

  try {
    if (typeof code === 'undefined') {
      const rootResponse = await axios.get('https://nhentai.net');
  
      code = parseInt(Array.from((rootResponse.data as string).matchAll(new RegExp(/\/g\/\d+/g)))[5][0].substring(3));
    }

    const response = await axios.get(`https://nhentai.net/g/${code}`)

    code = parseInt(response.request.path.substring(3) as string);
    
    if (! /<a href="\/language\/english\/"/g.test(response.data as string)) {
      code--;
      setTimeout(() => nukecodeNickname(client, code), 3000);
      return;
    }

    Object.keys(nukecodeMapJson).forEach(async guildId => {
      try {
        const guild = await client.guilds.fetch(guildId);
    
        nukecodeMapJson[guildId].forEach(async userId => {
          const member = await guild.members.fetch(userId);
    
          member.setNickname(`[Unethical] ${code}`);
        });
      } catch (error) {
        console.error(error);
      }
    });
  } catch (error) {
    console.error(error);
  }
}