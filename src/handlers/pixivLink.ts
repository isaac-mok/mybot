import { Message, TextChannel } from 'discord.js'

export default async function pixivLink(message: Message<boolean>) {
  if (message.author.bot) return

  // Check channel validity
  const channel = message.channel

  if (!(channel instanceof TextChannel)) return

  // Check if message has twitter link and get it
  if (message.content.match(/https:\/\/www.pixiv.net\/en\/artworks\/\d+/ig) !== null) replace()

  async function replace() {
    try {
      const matches = message.content.match(/https:\/\/www.pixiv.net\/en\/artworks\/\d+/ig);
      if (matches !== null && matches.length > 0) {
        const links = matches.map(match => match.replaceAll(/https:\/\/www.pixiv.net/ig, 'https://phixiv.net'))
        const newMessage = links.join("\n");

        await message.reply({
          content: newMessage,
          allowedMentions: {
            repliedUser: false,
          }
        })
      }
    } catch (error) {
      console.error(error)
    }
  }
}
