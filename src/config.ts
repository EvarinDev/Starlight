import { NodeOptions } from "sakulink";
import "dotenv/config";

const config: { [key: string]: IConfig } = {
	development: {
		TOKEN: process.env.DISCORD_TOKEN,
		REDIS: process.env.DEVELOPMENT_REDIS,
		Lavalink: [
			{
				identifier: "Jirayu.net[0] [recommend]",
				host: "lavalink.jirayu.net",
				password: "youshallnotpass",
				port: 13592,
				playback: true,
				search: true,
				version: "v4",
			},
		],
	},
	production: {
		TOKEN: process.env.PRODUCTION_TOKEN,
		REDIS: process.env.PRODUCTION_REDIS,
		Lavalink: [
			{
				identifier: "Jirayu.net[1]",
				host: "lavalink.jirayu.net",
				password: "youshallnotpass",
				port: 13592,
				playback: false,
				search: false,
				version: "v4",
			},
		],
	},
};
export default config[process.env.NODE_ENV || "development"] as IConfig;

interface IConfig {
	Lavalink: NodeOptions[];
	REDIS?: string;
	DSA?: string;
	TOKEN: string;
}
