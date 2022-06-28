import { Client, Message, MessageEmbed, TextChannel } from "discord.js";
import { Client as TwitterClient } from 'twitter-api-sdk';

export default async function sensitiveTwitter(client: Client<boolean>, message: Message<boolean>) {
  if (message.author.bot) return;

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