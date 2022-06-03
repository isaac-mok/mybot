import { Client, Intents, Message, TextChannel, MessageEmbed } from 'discord.js';
import { Client as TwitterClient } from 'twitter-api-sdk';
import { config } from 'dotenv';
import { generate } from 'short-uuid';
import axios from 'axios';

config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
  console.log('Logged in.');
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  sensitiveTwitter(message);
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

async function nukecodeNickname(code?: number) {
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
      setTimeout(() => nukecodeNickname(code), 3000);
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

async function sensitiveTwitter(message: Message<boolean>) {
  // Check channel validity
  const channel = message.channel;

  if (!(channel instanceof TextChannel)) return;

  if (! channel.nsfw) return;
  
  // Check if message has twitter link and get its ID
  const matchArr = message.content.match(/https:\/\/twitter.com\/[\w\/?=&]+/g);

  if (matchArr === null) return;

  const tweetIdMatchArr = matchArr[0].match(/status\/\d+/g);

  if (tweetIdMatchArr === null) return;

  const tweetId = tweetIdMatchArr[0].substring(7);

  // Wait and see if Discord embeds or not. Because Twitter API possibly_sensitive
  // is different from Tweet age restricted.
  setTimeout(async () => {
    if ((await message.fetch()).embeds.length === 0) retrieveAndEmbed();
  }, 5000);

  async function retrieveAndEmbed() {
    // Initiate twitter client and lookup
    const twitterToken = process.env.TWITTER_TOKEN;

    if (typeof twitterToken === 'undefined') throw 'Twitter token not set in .env';

    try {
      const twitterClient = new TwitterClient(twitterToken);

      const tweet = await twitterClient.tweets.findTweetById(tweetId, {
        expansions: ['author_id', 'attachments.media_keys'],
        "media.fields": ['url'],
        "user.fields": ['profile_image_url'],
        "tweet.fields": ['public_metrics', 'possibly_sensitive'],
      });

      if (! tweet.data?.possibly_sensitive) return;

      const author = tweet.includes?.users ? tweet.includes?.users[0] : {name: '', username: '', profile_image_url: ''};
      
      const messageEmbed = new MessageEmbed()
        .setColor('#1DA1F2')
        .setURL((matchArr as RegExpMatchArray)[0])
        .setAuthor({name: `${author.name} (${author.username})`, iconURL: author.profile_image_url, url: `https://twitter.com/${author.username}` })
        .setDescription(tweet.data?.text || '')
        .addFields(
          { name:'Likes', value: tweet.data?.public_metrics?.like_count.toString() || '', inline: true },
          { name: 'Retweets', value: tweet.data?.public_metrics?.retweet_count.toString() || '', inline: true }
        );

      const photos = tweet.includes?.media?.filter(media => media.type === 'photo') as Photo[];
        
      if (typeof photos !== 'undefined' && photos.length > 0) {
        messageEmbed.setImage(photos[0].url);
      }

      message.reply({
        embeds: [messageEmbed],
        allowedMentions: {
          repliedUser: false,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }
}

interface Photo {
  type: 'photo'
  media_key: string | undefined
  height: number | undefined
  width: number | undefined
  url: string
}
