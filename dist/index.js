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
const discord_js_1 = require("discord.js");
const twitter_api_sdk_1 = require("twitter-api-sdk");
const dotenv_1 = require("dotenv");
const short_uuid_1 = require("short-uuid");
const axios_1 = __importDefault(require("axios"));
(0, dotenv_1.config)();
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES] });
client.on('ready', () => {
    console.log('Logged in.');
});
client.on('messageCreate', (message) => {
    if (message.author.bot)
        return;
    sensitiveTwitter(message);
});
const token = process.env.DISCORD_TOKEN;
if (typeof token === 'undefined')
    throw 'Token not set in .env';
start();
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.login(token);
        uuidNickname();
        setInterval(uuidNickname, 3600000);
        nukecodeNickname();
        setInterval(nukecodeNickname, 600000);
    });
}
function uuidNickname() {
    const uuidMap = process.env.UUID_MAP;
    if (typeof uuidMap === 'undefined')
        throw 'UUID map not set in .env';
    const uuidMapJson = JSON.parse(uuidMap);
    Object.keys(uuidMapJson).forEach((guildId) => __awaiter(this, void 0, void 0, function* () {
        try {
            const guild = yield client.guilds.fetch(guildId);
            uuidMapJson[guildId].forEach((userId) => __awaiter(this, void 0, void 0, function* () {
                const member = yield guild.members.fetch(userId);
                member.setNickname((0, short_uuid_1.generate)());
            }));
        }
        catch (error) {
            console.error(error);
        }
    }));
}
function nukecodeNickname(code) {
    return __awaiter(this, void 0, void 0, function* () {
        const nukecodeMap = process.env.NUKECODE_MAP;
        if (typeof nukecodeMap === 'undefined')
            throw 'Nukecode map not set in .env';
        const nukecodeMapJson = JSON.parse(nukecodeMap);
        try {
            if (typeof code === 'undefined') {
                const rootResponse = yield axios_1.default.get('https://nhentai.net');
                code = parseInt(Array.from(rootResponse.data.matchAll(new RegExp(/\/g\/\d+/g)))[5][0].substring(3));
            }
            const response = yield axios_1.default.get(`https://nhentai.net/g/${code}`);
            code = parseInt(response.request.path.substring(3));
            if (!/<a href="\/language\/english\/"/g.test(response.data)) {
                code--;
                setTimeout(() => nukecodeNickname(code), 3000);
                return;
            }
            Object.keys(nukecodeMapJson).forEach((guildId) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const guild = yield client.guilds.fetch(guildId);
                    nukecodeMapJson[guildId].forEach((userId) => __awaiter(this, void 0, void 0, function* () {
                        const member = yield guild.members.fetch(userId);
                        member.setNickname(`[Unethical] ${code}`);
                    }));
                }
                catch (error) {
                    console.error(error);
                }
            }));
        }
        catch (error) {
            console.error(error);
        }
    });
}
function sensitiveTwitter(message) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return __awaiter(this, void 0, void 0, function* () {
        // Check channel validity
        const channel = message.channel;
        if (!(channel instanceof discord_js_1.TextChannel))
            return;
        if (!channel.nsfw)
            return;
        // Check if message has twitter link and get its ID
        const matchArr = message.content.match(/https:\/\/twitter.com\/[\w\/?=&]+/g);
        if (matchArr === null)
            return;
        const tweetIdMatchArr = matchArr[0].match(/status\/\d+/g);
        if (tweetIdMatchArr === null)
            return;
        const tweetId = tweetIdMatchArr[0].substring(7);
        // Check if has embed to know if tweet is sensitive
        if (message.embeds.length !== 0)
            return;
        // Initiate twitter client and lookup
        const twitterToken = process.env.TWITTER_TOKEN;
        if (typeof twitterToken === 'undefined')
            throw 'Twitter token not set in .env';
        try {
            const twitterClient = new twitter_api_sdk_1.Client(twitterToken);
            const tweet = yield twitterClient.tweets.findTweetById(tweetId, {
                expansions: ['author_id', 'attachments.media_keys'],
                "media.fields": ['url'],
                "user.fields": ['profile_image_url'],
                "tweet.fields": ['public_metrics'],
            });
            const author = ((_a = tweet.includes) === null || _a === void 0 ? void 0 : _a.users) ? (_b = tweet.includes) === null || _b === void 0 ? void 0 : _b.users[0] : { name: '', username: '', profile_image_url: '' };
            const messageEmbed = new discord_js_1.MessageEmbed()
                .setColor('#1DA1F2')
                .setURL(matchArr[0])
                .setAuthor({ name: `${author.name} (${author.username})`, iconURL: author.profile_image_url, url: `https://twitter.com/${author.username}` })
                .setDescription(((_c = tweet.data) === null || _c === void 0 ? void 0 : _c.text) || '')
                .addFields({ name: 'Likes', value: ((_e = (_d = tweet.data) === null || _d === void 0 ? void 0 : _d.public_metrics) === null || _e === void 0 ? void 0 : _e.like_count.toString()) || '', inline: true }, { name: 'Retweets', value: ((_g = (_f = tweet.data) === null || _f === void 0 ? void 0 : _f.public_metrics) === null || _g === void 0 ? void 0 : _g.retweet_count.toString()) || '', inline: true });
            const photos = (_j = (_h = tweet.includes) === null || _h === void 0 ? void 0 : _h.media) === null || _j === void 0 ? void 0 : _j.filter(media => media.type === 'photo');
            if (typeof photos !== 'undefined' && photos.length > 0) {
                messageEmbed.setImage(photos[0].url);
            }
            message.reply({
                embeds: [messageEmbed],
                allowedMentions: {
                    repliedUser: false,
                },
            });
        }
        catch (error) {
            console.error(error);
        }
    });
}
