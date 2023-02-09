"use strict";
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
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(guild
            ? v10_1.Routes.applicationGuildCommands(appId, guild)
            : v10_1.Routes.applicationCommands(appId), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
    }
})();
