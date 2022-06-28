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
const short_uuid_1 = require("short-uuid");
function uuidNickname(client) {
    const uuidMap = process.env.UUID_MAP;
    if (typeof uuidMap === 'undefined')
        throw 'UUID map not set in .env or dotenv not configured.';
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
exports.default = uuidNickname;
