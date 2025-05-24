// @ts-check is better
const { config } = require('seyfert');
require("dotenv/config");
const c = require("./dist/config.js");

module.exports = config.bot({
    token: c.default.TOKEN ?? "",
    applicationId: c.default.APPLICATION_ID ?? "",
    intents: ["Guilds", "GuildVoiceStates"],
    locations: {
        base: "src/client",
        commands: "commands",
        events: "events",
        langs: "languages"
    }
});