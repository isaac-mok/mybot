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
const dotenv_1 = require("dotenv");
const sensitiveTwitter_1 = __importDefault(require("./handlers/sensitiveTwitter"));
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
    (0, sensitiveTwitter_1.default)(client, message);
});
client.on("messageDelete", (message) => __awaiter(void 0, void 0, void 0, function* () {
    (0, sniper_1.sniperStoreDelete)(message);
}));
client.on('messageUpdate', (oldMessage, newMessage) => __awaiter(void 0, void 0, void 0, function* () {
    (0, sniper_1.sniperStoreEdit)(oldMessage, newMessage);
}));
client.on('messageReactionRemove', (reaction, user) => __awaiter(void 0, void 0, void 0, function* () {
    (0, sniper_1.sniperStoreReactionRemove)(reaction, user);
}));
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    (0, sniper_1.sniperInteraction)(client, interaction);
}));
const token = process.env.DISCORD_TOKEN;
if (typeof token === 'undefined')
    throw 'Token not set in .env';
start();
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.login(token);
        // uuidNickname();
        // setInterval(uuidNickname, 3600000);
        // nukecodeNickname();
        // setInterval(nukecodeNickname, 600000);
    });
}
