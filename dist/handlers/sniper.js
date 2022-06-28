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
exports.sniperInteraction = exports.sniperStoreReactionRemove = exports.sniperStoreEdit = exports.sniperStoreDelete = void 0;
const discord_js_1 = require("discord.js");
const snipes = {};
const snipesByUser = {};
const editSnipes = {};
const editSnipesByUser = {};
const reactionSnipes = {};
const reactionSnipesByUser = {};
const formatEmoji = (emoji) => {
    return !emoji.id || (emoji instanceof discord_js_1.GuildEmoji ? emoji.available : false)
        ? emoji.toString() // bot has access or unicode emoji
        : `[:${emoji.name}:](${emoji.url})`; // bot cannot use the emoji
};
function sniperStoreDelete(message) {
    if (message.partial || (message.embeds.length && !message.content))
        return; // content is null or deleted embed
    const image = message.attachments.first();
    const content = {
        author: message.author,
        content: message.content,
        createdAt: message.createdTimestamp,
        image: typeof image !== 'undefined'
            ? image.proxyURL
            : null,
    };
    snipes[message.channel.id] = content;
    snipesByUser[message.author.id] = content;
}
exports.sniperStoreDelete = sniperStoreDelete;
function sniperStoreEdit(oldMessage, newMessage) {
    if (oldMessage.partial)
        return; // content is null
    const content = {
        author: oldMessage.author,
        content: oldMessage.content,
        createdAt: newMessage.editedTimestamp,
    };
    editSnipes[oldMessage.channel.id] = content;
    editSnipesByUser[oldMessage.author.id] = content;
}
exports.sniperStoreEdit = sniperStoreEdit;
function sniperStoreReactionRemove(reaction, user) {
    return __awaiter(this, void 0, void 0, function* () {
        if (reaction.partial)
            reaction = yield reaction.fetch();
        const content = {
            user: user,
            emoji: reaction.emoji,
            messageURL: reaction.message.url,
            createdAt: Date.now(),
        };
        reactionSnipes[reaction.message.channel.id] = content;
        const author = reaction.message.author;
        if (author !== null)
            reactionSnipesByUser[author.id] = content;
    });
}
exports.sniperStoreReactionRemove = sniperStoreReactionRemove;
function sniperInteraction(client, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!interaction.isCommand())
                return;
            const channel = (interaction.options.getChannel("channel") || interaction.channel);
            if (channel === null)
                return;
            const user = interaction.options.getUser("target") || null;
            if (interaction.commandName === "snipe") {
                let snipe;
                if (user !== null) {
                    snipe = snipesByUser[user.id];
                }
                else {
                    if (channel !== null)
                        snipe = snipes[channel.id];
                }
                if (!snipe)
                    return interaction.reply("There's nothing to snipe!");
                const embed = new discord_js_1.MessageEmbed()
                    .setAuthor({
                    name: snipe.author.tag,
                    iconURL: snipe.author.avatarURL() || ''
                })
                    .setFooter({
                    text: `#${channel.name}`,
                })
                    .setTimestamp(snipe.createdAt);
                snipe.content ? embed.setDescription(snipe.content) : null;
                snipe.image ? embed.setImage(snipe.image) : null;
                yield interaction.reply({ embeds: [embed] });
            }
            else if (interaction.commandName === "editsnipe") {
                let snipe;
                if (user !== null) {
                    snipe = editSnipesByUser[user.id];
                }
                else {
                    snipe = editSnipes[channel.id];
                }
                yield interaction.reply(snipe
                    ? {
                        embeds: [
                            new discord_js_1.MessageEmbed()
                                .setDescription(snipe.content)
                                .setAuthor({
                                name: snipe.author.tag,
                                iconURL: snipe.author.avatarURL() || ''
                            })
                                .setFooter({
                                text: `#${channel.name}`
                            })
                                .setTimestamp(snipe.createdAt),
                        ],
                    }
                    : "There's nothing to snipe!");
            }
            else if (interaction.commandName === "reactionsnipe") {
                let snipe;
                if (user !== null) {
                    snipe = reactionSnipesByUser[user.id];
                }
                else {
                    snipe = reactionSnipes[channel.id];
                }
                yield interaction.reply(snipe
                    ? {
                        embeds: [
                            new discord_js_1.MessageEmbed()
                                .setDescription(`reacted with ${formatEmoji(snipe.emoji)} on [this message](${snipe.messageURL})`)
                                .setAuthor({
                                name: snipe.user.tag || '',
                                iconURL: snipe.user.avatarURL() || '',
                            })
                                .setFooter({
                                text: `#${channel.name}`
                            })
                                .setTimestamp(snipe.createdAt),
                        ],
                    }
                    : "There's nothing to snipe!");
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.sniperInteraction = sniperInteraction;
