import config from "../../config";
import { Client } from "seyfert";
import { PrismaClient } from "@prisma/client";
import { ServiceLoader } from "./ServiceExecute";
import { Manager } from "sakulink";
import { ErrorRequest } from "./utils/Client";
import { Redis } from "ioredis";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { StringCacheAdapter } from "./utils/StringCacheAdapter";

export class Starlight extends Client {
	public redis: Redis;
	public sakulink: Manager;
	public prisma: PrismaClient;
	public services: ServiceLoader;
	public cluster: ClusterClient<this>;
	public get uptime(): number {
		return process.uptime() * 1000;
	}
	constructor() {
		super({
			shards: {
				start: getInfo().FIRST_SHARD_ID,
				end: getInfo().SHARD_LIST.length
			},
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
		this.cluster = new ClusterClient(this);
		this.sakulink = new Manager({
			nodes: config.Lavalink,
			shards: this.cluster.info.TOTAL_SHARDS,
			autoMove: true,
			autoResume: true,
			autoPlay: true,
			send: (id, payload) => {
				this.guilds.fetch(id).then(guild => {
					if (!guild) return;
					const shardId = this.gateway.calculateShardId(guild.id);
					this.gateway.send(shardId, payload);
				}).catch((error: Error) => {
					this.logger.error(`Failed to send payload: ${error.message}`);
				});
			},
		});
		this.setServices({
			langs: {
				default: "en",
			},
			cache: {
				disabledCache: {
					threads: true,
					overwrites: true,
					emojis: true,
					messages: true,
					stickers: true,
					bans: true,
					presences: true,
					stageInstances: true,
					channels: true,
				},
				adapter: new StringCacheAdapter()
			},
		});
		this.redis = new Redis(config.REDIS)
		this.prisma = new PrismaClient();
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
