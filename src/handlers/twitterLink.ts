import { Message, TextChannel } from 'discord.js'

export default async function twitterLink(message: Message<boolean>) {
  if (message.author.bot) return

  // Check channel validity
  const channel = message.channel

  if (!(channel instanceof TextChannel)) return

  // Check if message has twitter link and get it
  if (message.content.match(/https:\/\/(twitter|x).com/ig) !== null) setTimeout(replaceIfNone, 3000)

  async function replaceIfNone() {
    try {
      message = await message.fetch()
      if (message.embeds.length === 0 || (message.embeds[0].image === null && message.embeds[0].description === null)) {
        const matches = message.content.match(/https:\/\/(twitter|x)\.com[\w\d\/\-?=]+/ig);
        if (matches !== null && matches.length > 0) {
          const links = matches.map(match => match.replaceAll(/https:\/\/(twitter|x).com/ig, 'https://fxtwitter.com'))
          const newMessage = links.join("\n");
  
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
