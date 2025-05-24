import config from "../../config";
import { PrismaClient } from "@prisma/client";
import { ServiceLoader } from "./ServiceExecute";
import { ErrorRequest } from "./utils/Client";
import { Redis } from "ioredis";
import { LithiumXManager } from "lithiumx";
import { ClusterClient } from "./utils/cluster/ClusterClient";
import { Utils } from "./Utils";
import DiscordAnalytics from "@/lib/DiscordAnalytics";
export class Starlight extends ClusterClient {
	public redis: Redis;
	public lithiumx: LithiumXManager;
	public prisma: PrismaClient;
	public services: ServiceLoader;
	public get uptime(): number {
		return process.uptime() * 1000;
	}
	public analytics: DiscordAnalytics = new DiscordAnalytics({
		client: this,
		apiToken: config.DSA,
		sharded: true,
	})
	public utils: Utils = new Utils(this);
	constructor() {
		super({
			commands: {
				defaults: {
					onAfterRun(context, error: Error) {
						if (error) return context.client.logger.error(`Error running command ${context.command.name} | User: ${context.author.username}(${context.author.id}) | Error: ${error.message}`);
					},
					onRunError: async (ctx, error: Error) => {
						this.logger.error(error);
						return ErrorRequest(ctx, error);
					},
				},
			}
		});
		this.lithiumx = new LithiumXManager({
			nodes: config.Lavalink,
			autoPlay: true,
			caches: {
				enabled: true,
				time: 60000,
			},
			defaultSearchPlatform: "youtube",
            send: async (id, payload) => {
                this.guilds.fetch(id).then(async guild => {
					if (!guild) return;
					const shard = (await this.guilds.fetch(id)).shard
                    shard.send(false, JSON.parse(JSON.stringify(payload)))
				}).catch((error: Error) => {
					this.logger.error(`Failed to send payload: ${error.message}`);
				});
            }
		});
		this.lithiumx.init(config.CLIENT_ID);
		this.setServices({
			langs: {
				default: "en",
			},
			cache: {
				disabledCache: {
					overwrites: true,
					emojis: true,
					messages: true,
					stickers: true,
					bans: true,
					presences: true,
					stageInstances: true,
					channels: true,
				},
			},
		});
		this.redis = new Redis(config.REDIS)
		this.prisma = new PrismaClient();
		this.prisma.$connect().then(() => {
			this.logger.info("[System] Prisma connected");
		}).catch((error: Error) => {
			this.logger.error(`[System] Prisma error: ${error.message}`);
		});
		this.services = new ServiceLoader(this);
		this.services.load().then(() => {
			this.logger.info(`[System] Services loaded`);
		}).catch((error: Error) => {
			this.logger.error(`[System] Error loading plugins: ${error.message}`);
		});
	}
	public FormatTime(milliseconds: number): string {
		const seconds = Math.floor((milliseconds / 1000) % 60);
		const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
		const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
		const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

		const timeParts = [];
		if (days > 0) {
			timeParts.push(`${days}d`);
		}
		if (hours > 0) {
			timeParts.push(`${hours}h`);
		}
		if (minutes > 0) {
			timeParts.push(`${minutes}m`);
		}
		if (seconds > 0) {
			timeParts.push(`${seconds}s`);
		}

		return timeParts.join(" ");
	}
	public FormatMemory(bytes: number | string): string {
		const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
		if (typeof bytes === "string") {
			bytes = parseInt(bytes);
		}
		if (bytes === 0) return "0 Byte";
		const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
		return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
	}
	public async reboot() {
		await this.services.reboot();
		await this.commands.reloadAll();
		await this.events.reloadAll();
		this.logger.info("[System] Rebooted");
	}
}
