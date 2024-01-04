import { Message, TextChannel } from 'discord.js'

export default async function redditLink(message: Message<boolean>) {
  if (message.author.bot) return

  // Check channel validity
  const channel = message.channel

  if (!(channel instanceof TextChannel)) return

  // Check if message has twitter link and get it
  if (message.content.match(/https:\/\/www.reddit.com/ig) !== null) replace()

  async function replace() {
    try {
      const matches = message.content.match(/https:\/\/www.reddit\.com[\w\d\/\-?=]+/ig);
      if (matches !== null && matches.length > 0) {
        const links = matches.map(match => match.replaceAll(/https:\/\/www.reddit.com/ig, 'https://rxddit.com'))
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
