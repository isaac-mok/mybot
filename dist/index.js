"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const pixivImage_1 = __importDefault(require("./handlers/pixivImage"));
const sniper_1 = require("./handlers/sniper");
(0, dotenv_1.config)();
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.Intents.FLAGS.GUILDS,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGES,
        discord_js_1.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
    partials: ["MESSAGE", "REACTION", "USER"],
});
client.on('ready', () => {
    console.log('Logged in.');
});
client.on('messageCreate', (message) => {
    (0, pixivImage_1.default)(message);
});
client.on("messageDelete", async (message) => {
    (0, sniper_1.sniperStoreDelete)(message);
});
client.on('messageUpdate', async (oldMessage, newMessage) => {
    (0, sniper_1.sniperStoreEdit)(oldMessage, newMessage);
});
client.on('messageReactionRemove', async (reaction, user) => {
    (0, sniper_1.sniperStoreReactionRemove)(reaction, user);
});
client.on('interactionCreate', async (interaction) => {
    (0, sniper_1.sniperInteraction)(client, interaction);
});
const token = process.env.DISCORD_TOKEN;
if (typeof token === 'undefined')
    throw 'Token not set in .env';
start();
async function start() {
    await client.login(token);
}
