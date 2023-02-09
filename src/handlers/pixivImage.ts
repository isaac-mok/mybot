import axios from "axios"
import { JSDOM } from "jsdom"
import { Message, MessageEmbed, TextChannel } from "discord.js"
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs"
import { execSync } from "child_process"

const imageDir = './images'

if (! existsSync(imageDir)) mkdirSync(imageDir)

export default async function pixivImage(message: Message<boolean>) {
  if (message.author.bot) return

  // Check channel validity
  const channel = message.channel

  if (!(channel instanceof TextChannel)) return

  if (! channel.nsfw) return

  // Check if message has pixiv link and get it
  const matchArr = message.content.match(/https:\/\/www.pixiv.net\/en\/artworks\/\d+/g)

  if (matchArr === null) return

  const pixivLink = matchArr[0]

  retrieveAndEmbed()

  async function retrieveAndEmbed() {
    try {
      const resData = (await axios.get(pixivLink)).data
      const dom = new JSDOM(resData)

      const el = dom.window.document.getElementById('meta-preload-data') as HTMLMetaElement
      const data = JSON.parse(el.content) as MetaPreloadData
      const illust = data.illust[Object.keys(data.illust)[0]]
      const author = data.user[Object.keys(data.user)[0]]

      let regular = illust.urls.regular
      if (regular === null) {
        const url = illust.userIllusts[illust.id].url
        const datePosition = url.indexOf('/img/20')
        const datePath = url.substring(datePosition, datePosition + 24)
        regular = `https://i.pximg.net/img-original${datePath}/${illust.id}_p0.jpg`
      }
      const image = `${imageDir}/${illust.id}.jpg`

      execSync(`wget "--header=referer: https://www.pixiv.net/" ${regular} -O ${image}`)
      
      const messageEmbed = new MessageEmbed()
        .setColor('#000000')
        .setTitle(illust.title)
        .setURL(pixivLink)
        .setAuthor({name: `${author.name}`, url: `https://www.pixiv.net/en/users/${author.userId}` })
        .setImage(`attachment://${illust.id}.jpg`)

      if (illust.pageCount > 1) messageEmbed.setDescription(`${illust.pageCount - 1} images not embedded. Click link to view.`)

      await message.reply({
        embeds: [messageEmbed],
        allowedMentions: {
          repliedUser: false,
        },
        files: [image]
      })

      rmSync(image)
    } catch (error) {
      console.error(error)
    }
  }
}

interface MetaPreloadData {
  timestamp: string
  illust: Record<string, {
    id: string
    title: string
    urls: {
      mini: string
      thumb: string
      small: string
      regular: string
      original: string
    },
    pageCount: number
    userIllusts: Record<string, {
      url: string
    }>
  }>
  user: Record<string, {
    userId: string
    name: string
  }>
}
