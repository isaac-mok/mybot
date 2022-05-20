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
const short_uuid_1 = require("short-uuid");
const axios_1 = __importDefault(require("axios"));
(0, dotenv_1.config)();
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS] });
client.on('ready', () => {
    console.log('Logged in.');
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
function nukecodeNickname() {
    return __awaiter(this, void 0, void 0, function* () {
        const nukecodeMap = process.env.NUKECODE_MAP;
        if (typeof nukecodeMap === 'undefined')
            throw 'Nukecode map not set in .env';
        const nukecodeMapJson = JSON.parse(nukecodeMap);
        console.log(nukecodeMapJson);
        try {
            const response = yield axios_1.default.get('https://nhentai.net');
            const code = Array.from(response.data.matchAll(new RegExp(/\/g\/\d+/g)))[5][0];
            console.log(code);
            Object.keys(nukecodeMapJson).forEach((guildId) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const guild = yield client.guilds.fetch(guildId);
                    nukecodeMapJson[guildId].forEach((userId) => __awaiter(this, void 0, void 0, function* () {
                        const member = yield guild.members.fetch(userId);
                        member.setNickname(code);
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
