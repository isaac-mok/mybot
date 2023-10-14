import { Message, TextChannel } from 'discord.js'

export default async function twitterLink(message: Message<boolean>) {
  if (message.author.bot) return

  // Check channel validity
  const channel = message.channel

  if (!(channel instanceof TextChannel)) return

  // Check if message has pixiv link and get it
  if (message.content.match(/https:\/\/(twitter|x).com/ig) !== null) setTimeout(embedIfNone, 3000);

  async function embedIfNone() {
    try {
      message = await message.fetch()
      if (message.embeds.length === 0) {
        if (message.content.match(/https:\/\/(twitter|x).com/ig) !== null) {
          const newMessage = message.content.replaceAll(/https:\/\/(twitter|x).com/ig, 'https://fxtwitter.com');
  
          await message.reply({
            content: newMessage,
            allowedMentions: {
              repliedUser: false,
            }
          })
        }
      }
    } catch (error) {
      console.error(error)
    }
  }
}
