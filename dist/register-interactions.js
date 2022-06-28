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
const rest_1 = require("@discordjs/rest");
const dotenv_1 = require("dotenv");
const v10_1 = require("discord-api-types/v10");
(0, dotenv_1.config)();
const guild = process.argv[2];
const commands = [
    {
        name: "snipe",
        description: "Shows the last deleted message from a specified channel!",
        options: [
            {
                type: 6,
                name: "target",
                description: "The user to snipe",
            },
            {
                type: 7,
                name: "channel",
                description: "The channel to snipe",
            },
        ],
    },
    {
        name: "editsnipe",
        description: "Shows the last edited message from a specified channel!",
        options: [
            {
                type: 6,
                name: "target",
                description: "The user to snipe",
            },
            {
                type: 7,
                name: "channel",
                description: "The channel to snipe",
            },
        ],
    },
    {
        name: "reactionsnipe",
        description: "Shows the last removed reaction from a specified channel!",
        options: [
            {
                type: 6,
                name: "target",
                description: "The user to snipe",
            },
            {
                type: 7,
                name: "channel",
                description: "The channel to snipe",
            },
        ],
    },
];
const token = process.env.DISCORD_TOKEN;
const appId = process.env.DISCORD_APP_ID;
const rest = new rest_1.REST({ version: '10' }).setToken(token);
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Started refreshing application (/) commands.');
        yield rest.put(guild
            ? v10_1.Routes.applicationGuildCommands(appId, guild)
            : v10_1.Routes.applicationCommands(appId), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
    }
}))();
