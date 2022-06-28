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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const twitter_api_sdk_1 = require("twitter-api-sdk");
function sensitiveTwitter(client, message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (message.author.bot)
            return;
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
        // Wait and see if Discord embeds or not. Because Twitter API possibly_sensitive
        // is different from Tweet age restricted.
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            if ((yield message.fetch()).embeds.length === 0)
                retrieveAndEmbed();
        }), 5000);
        function retrieveAndEmbed() {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return __awaiter(this, void 0, void 0, function* () {
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
                        "tweet.fields": ['public_metrics', 'possibly_sensitive'],
                    });
                    if (!((_a = tweet.data) === null || _a === void 0 ? void 0 : _a.possibly_sensitive))
                        return;
                    const author = ((_b = tweet.includes) === null || _b === void 0 ? void 0 : _b.users) ? (_c = tweet.includes) === null || _c === void 0 ? void 0 : _c.users[0] : { name: '', username: '', profile_image_url: '' };
                    const messageEmbed = new discord_js_1.MessageEmbed()
                        .setColor('#1DA1F2')
                        .setURL(matchArr[0])
                        .setAuthor({ name: `${author.name} (${author.username})`, iconURL: author.profile_image_url, url: `https://twitter.com/${author.username}` })
                        .setDescription(((_d = tweet.data) === null || _d === void 0 ? void 0 : _d.text) || '')
                        .addFields({ name: 'Likes', value: ((_f = (_e = tweet.data) === null || _e === void 0 ? void 0 : _e.public_metrics) === null || _f === void 0 ? void 0 : _f.like_count.toString()) || '', inline: true }, { name: 'Retweets', value: ((_h = (_g = tweet.data) === null || _g === void 0 ? void 0 : _g.public_metrics) === null || _h === void 0 ? void 0 : _h.retweet_count.toString()) || '', inline: true });
                    const photos = (_k = (_j = tweet.includes) === null || _j === void 0 ? void 0 : _j.media) === null || _k === void 0 ? void 0 : _k.filter(media => media.type === 'photo');
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
    });
}
exports.default = sensitiveTwitter;
