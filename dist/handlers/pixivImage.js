"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const jsdom_1 = require("jsdom");
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const imageDir = './images';
if (!(0, fs_1.existsSync)(imageDir))
    (0, fs_1.mkdirSync)(imageDir);
async function pixivImage(message) {
    if (message.author.bot)
        return;
    // Check channel validity
    const channel = message.channel;
    if (!(channel instanceof discord_js_1.TextChannel))
        return;
    if (!channel.nsfw)
        return;
    // Check if message has pixiv link and get it
    const matchArr = message.content.match(/https:\/\/www.pixiv.net\/en\/artworks\/\d+/g);
    if (matchArr === null)
        return;
    const pixivLink = matchArr[0];
    retrieveAndEmbed();
    async function retrieveAndEmbed() {
        try {
            const resData = (await axios_1.default.get(pixivLink)).data;
            const dom = new jsdom_1.JSDOM(resData);
            const el = dom.window.document.getElementById('meta-preload-data');
            const data = JSON.parse(el.content);
            const illust = data.illust[Object.keys(data.illust)[0]];
            const author = data.user[Object.keys(data.user)[0]];
            let regular = illust.urls.regular;
            if (regular === null) {
                const url = illust.userIllusts[illust.id].url;
                const datePosition = url.indexOf('/img/20');
                const datePath = url.substring(datePosition, datePosition + 24);
                regular = `https://i.pximg.net/img-original${datePath}/${illust.id}_p0.jpg`;
            }
            const image = `${imageDir}/${illust.id}.jpg`;
            (0, child_process_1.execSync)(`wget "--header=referer: https://www.pixiv.net/" ${regular} -O ${image}`);
            const messageEmbed = new discord_js_1.MessageEmbed()
                .setColor('#000000')
                .setTitle(illust.title)
                .setURL(pixivLink)
                .setAuthor({ name: `${author.name}`, url: `https://www.pixiv.net/en/users/${author.userId}` })
                .setImage(`attachment://${illust.id}.jpg`);
            if (illust.pageCount > 1)
                messageEmbed.setDescription(`${illust.pageCount - 1} images not embedded. Click link to view.`);
            await message.reply({
                embeds: [messageEmbed],
                allowedMentions: {
                    repliedUser: false,
                },
                files: [image]
            });
            (0, fs_1.rmSync)(image);
        }
        catch (error) {
            console.error(error);
        }
    }
}
exports.default = pixivImage;
