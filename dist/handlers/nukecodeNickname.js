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
function nukecodeNickname(client, code) {
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
                setTimeout(() => nukecodeNickname(client, code), 3000);
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
exports.default = nukecodeNickname;
