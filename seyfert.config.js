// @ts-check is better
const { config } = require('seyfert');
require("dotenv/config");
const c = require("./dist/config.js");

module.exports = config.bot({
    token: c.default.TOKEN ?? "",
    intents: ["Guilds", "GuildVoiceStates"],
    locations: {
        base: "src/client",
        output: "dist/client",
        commands: "commands",
        events: "events",
        langs: "languages"
    }
});