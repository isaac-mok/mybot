"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function pixivImage(message) {
    return __awaiter(this, void 0, void 0, function* () {
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
        function retrieveAndEmbed() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const resData = (yield axios_1.default.get(pixivLink)).data;
                    const dom = new jsdom_1.JSDOM(resData);
                    const el = dom.window.document.getElementById('meta-preload-data');
                    const data = JSON.parse(el.content);
                    const illust = data.illust[Object.keys(data.illust)[0]];
                    const author = data.user[Object.keys(data.user)[0]];
                    const regular = illust.urls.regular;
                    const image = `${imageDir}/${illust.id}.jpg`;
                    (0, child_process_1.execSync)(`wget "--header=referer: https://www.pixiv.net/" ${regular} -O ${image}`);
                    const messageEmbed = new discord_js_1.MessageEmbed()
                        .setColor('#000000')
                        .setTitle(illust.title)
                        .setURL(pixivLink)
                        .setAuthor({ name: `${author.name}`, url: `https://www.pixiv.net/en/users/${author.userId}` })
                        .setImage(`attachment://${illust.id}.jpg`);
                    yield message.reply({
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
            });
        }
    });
}
exports.default = pixivImage;
