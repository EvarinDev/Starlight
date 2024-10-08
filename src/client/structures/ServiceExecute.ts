import { Collection } from "@discordjs/collection";
import fs from "fs";
import path from "path";
import { Starlight } from "./Starlight";
import { Node, Player, Track, TrackEndEvent, TrackExceptionEvent, TrackStartEvent, TrackStuckEvent, UnresolvedTrack, WebSocketClosedEvent } from "sakulink";
import { CommandContext } from "seyfert";
import { IDatabase } from "../interfaces/IDatabase";

export class ServiceLoader {
	commands: ServiceExecute[] = [];
	services: ServiceExecute[] = [];
	lavalink: PlayerExecute[] = [];
	private client: Starlight;
	private collection: Collection<string, ServiceExecute> = new Collection();
	private loadedFiles: Set<string> = new Set();
	private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

	constructor(client: Starlight) {
		this.client = client;
		this.watchServices();
	}

	private watchServices() {
		const servicesDir = path.join(__dirname, "../service");
		fs.watch(servicesDir, { recursive: true, persistent: true }, (eventType, filename) => {
			if (filename && (eventType === "change" || eventType === "rename")) {
				this.client.logger.info(`Detected change in ${filename}, reloading commands...`);
				const filePath = path.join(servicesDir, filename);
				this.debounce(filePath, async () => {
					if (this.loadedFiles.has(filePath)) {
						this.unload(filePath);
					}
					await this.loadFile(filePath);
				});
			}
		});
	}

	private debounce(filePath: string, callback: () => void, delay: number = 100) {
		if (this.debounceTimers.has(filePath)) {
			clearTimeout(this.debounceTimers.get(filePath));
		}
		const timer = setTimeout(() => {
			callback();
			this.debounceTimers.delete(filePath);
		}, delay) as unknown as NodeJS.Timeout;
		this.debounceTimers.set(filePath, timer);
	}

	private unload(filePath: string) {
		delete require.cache[require.resolve(filePath)];
		this.loadedFiles.delete(filePath);
		this.lavalink = this.lavalink.filter((event) => {
			if (event.filePath === filePath) {
				this.client.sakulink.off(event.name as string, event.execute);
				return false;
			}
			return true;
		});
		this.commands = this.commands.filter((service) => {
			if (service.filePath === filePath) {
				this.collection.delete(service.name);
				return false;
			}
			return true;
		});
		this.services = this.services.filter((service) => {
			if (service.filePath === filePath) {
				this.collection.delete(service.name);
				return false;
			}
			return true;
		});
	}

	public async execute(name: string, ...args: any[]) {
		const plugin = this.collection.get(name);
		if (args[0] instanceof CommandContext) {
			const databaseString: string | null = await this.client.redis.get(`guild:${args[0].guildId}`);
			const guild = await this.client.guilds.fetch(args[0].guildId, true);
			const database: IDatabase = databaseString
				? JSON.parse(databaseString)
				: (await this.client.prisma.guild.findFirst({
					where: { id: guild.id },
				})) || {
					uuid: guild.id,
					id: guild.id,
					name: guild.name,
					roomid: "0",
					lang: "en",
					room: { id: "0", message: "0" },
				};
			args[0].editOrReply({
				embeds: [
					{
						color: 0x00ff00,
						description: "Please wait a moment while I process your request ...",
					},
				],
			})
			this.client.redis.set(`guild:${this.client.me.id}:${guild.id}`, JSON.stringify(database));
			if (plugin) return await plugin.execute?.(this.client, database, ...args);
		} else {
			if (plugin) return await plugin.execute?.(this.client, ...args);
		}
	}

	public async reboot() {
		this.lavalink = [];
		this.commands = [];
		this.services = [];
		this.collection.clear();
		this.loadedFiles.clear();
		this.debounceTimers.clear();
		await this.load();
	}

	public async load() {
		const servicesDir = path.join(__dirname, "../service");
		const files = fs.readdirSync(servicesDir, { withFileTypes: true });

		for (const folder of files) {
			if (folder.isDirectory()) {
				const folderPath = path.join(servicesDir, folder.name);
				const pluginFiles = fs.readdirSync(folderPath);

				for (const file of pluginFiles) {
					const filePath = path.join(folderPath, file);
					await this.loadFile(filePath);
				}
			}
		}
		this.client.logger.debug(`ServiceLoader: Loaded ${this.collection.size} plugins`);
	}

	private async loadFile(filePath: string) {
		try {
			delete require.cache[require.resolve(filePath)];
			const plugin = await import(filePath);

			const service: ServiceExecute | PlayerExecute = plugin.default;
			service.filePath = filePath;

			switch (path.basename(path.dirname(filePath))) {
				case "commands":
					this.commands.push(service as ServiceExecute);
					this.collection.set(service.name as string, service as ServiceExecute);
					this.client.logger.debug(`Loaded ServiceCommand: ${service.name as string}`);
					break;
				case "services":
					this.services.push(service as ServiceExecute);
					this.collection.set(service.name as string, service as ServiceExecute);
					this.client.logger.debug(`Loaded Service: ${service.name as string}`);
					break;
				case "player":
					this.lavalink.push(service as PlayerExecute);
					this.client.logger.info(`Loaded ServicePlayer: ${service.name as string}`);
					break;
				default:
					this.client.logger.warn(`Unknown file type for path: ${filePath}`);
					break;
			}
			this.loadedFiles.add(filePath);
			this.lavalink.forEach((event) => {
				if (!this.client.sakulink.listenerCount(event.name as string)) {
					this.client.sakulink.on(event.name as any, event.execute.bind(event, this.client));
				}
			});
		} catch (error) {
			this.client.logger.error(`Failed to load file: ${filePath}`, error);
			this.client.logger.error(`Error details: ${error.message}`, error.stack);
		}
	}
}

interface ServiceClass {
	name: string;
	execute: (client: Starlight, database: IDatabase, interaction: CommandContext) => void;
	filePath?: string;
}

export class ServiceExecute implements ServiceClass {
	public name: string;
	public execute: (client: Starlight, ...args: any) => void;
	public filePath?: string;

	constructor({ name, execute, filePath }: ServiceClass) {
		this.name = name;
		this.execute = execute;
		this.filePath = filePath;
	}
}

interface PlayerEventsClass {
	name: keyof ManagerEvents;
	execute: (client: Starlight, ...args: any) => Promise<void>;
	filePath?: string;
}

export class PlayerExecute implements PlayerEventsClass {
	public name: keyof ManagerEvents;
	public execute: (client: Starlight, ...args: any) => Promise<void>;
	public filePath?: string;

	constructor({ name, execute, filePath }: PlayerEventsClass) {
		this.name = name;
		this.execute = execute;
		this.filePath = filePath;
	}
}

interface ManagerEvents {
	nodeCreate(node: Node): void;
	nodeDestroy(node: Node): void;
	nodeConnect(node: Node): void;
	nodeReconnect(node: Node): void;
	nodeDisconnect(
		node: Node,
		reason: {
			code?: number;
			reason?: string;
		}
	): void;
	nodeError(node: Node, error: Error): void;
	nodeRaw(payload: unknown): void;
	playerCreate(player: Player): void;
	playerDestroy(player: Player): void;
	queueEnd(player: Player, track: Track | UnresolvedTrack, payload: TrackEndEvent): void;
	playerMove(player: Player, initChannel: string, newChannel: string): void;
	playerDisconnect(player: Player, oldChannel: string): void;
	trackStart(player: Player, track: Track, payload: TrackStartEvent): void;
	trackEnd(player: Player, track: Track, payload: TrackEndEvent): void;
	trackStuck(player: Player, track: Track, payload: TrackStuckEvent): void;
	trackError(player: Player, track: Track | UnresolvedTrack, payload: TrackExceptionEvent): void;
	socketClosed(player: Player, payload: WebSocketClosedEvent): void;
}
