import fs from "fs/promises";
import path from "path";
import { Starlight } from "./Starlight";
import { Node, Player, Track, TrackEndEvent, TrackExceptionEvent, TrackStartEvent, TrackStuckEvent, UnresolvedTrack, WebSocketClosedEvent } from "sakulink";
import { CommandContext } from "seyfert";
import { IDatabase } from "../interfaces/IDatabase";

type ServiceType = 'commands' | 'services' | 'player';

interface BaseService {
    name: string;
    execute: (...args: unknown[] | any[] ) => Promise<void>;
    filePath?: string;
}

export interface ServiceExecute extends BaseService {
    type: Exclude<ServiceType, 'player'>;
}

export interface PlayerExecute extends BaseService {
    type: 'player';
    name: keyof ManagerEvents;
}

export class ServiceLoader {
	private services: Map<ServiceType, Map<string, BaseService>> = new Map([
		['commands', new Map()],
		['services', new Map()],
		['player', new Map()]
	]);
	private loadedFiles: Set<string> = new Set();
	private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

	constructor(private client: Starlight) {
		this.watchServices();
	}

	private async watchServices() {
		const servicesDir = path.join(__dirname, "../service");
		const watcher = fs.watch(servicesDir, { recursive: true });
		for await (const { eventType, filename } of watcher) {
			if (filename && (eventType === "change" || eventType === "rename")) {
				this.client.logger.info(`Detected change in ${filename}, reloading...`);
				const filePath = path.join(servicesDir, filename);
				this.debounce(filePath, () => this.reloadFile(filePath));
			}
		}
	}

	private debounce(filePath: string, callback: () => Promise<void>, delay: number = 100) {
		const existingTimer = this.debounceTimers.get(filePath);
		if (existingTimer) clearTimeout(existingTimer);

		const timer = setTimeout(async () => {
			await callback();
			this.debounceTimers.delete(filePath);
		}, delay);

		this.debounceTimers.set(filePath, (timer as unknown) as NodeJS.Timeout);
	}

	private async reloadFile(filePath: string) {
		if (this.loadedFiles.has(filePath)) {
			await this.unloadFile(filePath);
		}
		await this.loadFile(filePath);
	}

	private async unloadFile(filePath: string) {
		delete require.cache[require.resolve(filePath)];
		this.loadedFiles.delete(filePath);

		for (const [type, serviceMap] of this.services) {
			for (const [name, service] of serviceMap) {
				if (service.filePath === filePath) {
					serviceMap.delete(name);
					if (type === 'player') {
						this.client.sakulink.off(name, service.execute);
					}
				}
			}
		}
	}

	public async execute(name: string, ...args: any[]) {
		for (const serviceMap of this.services.values()) {
			const service = serviceMap.get(name);
			if (service) {
				if (args[0] instanceof CommandContext) {
					const { guildId } = args[0];
					const database = await this.getDatabaseForGuild(guildId);
					await args[0].editOrReply({
						embeds: [{ color: 0x00ff00, description: "Please wait a moment while I process your request ..." }]
					});
					return service.execute(this.client, database, ...args);
				} else {
					return service.execute(this.client, ...args);
				}
			}
		}
	}


	private async getDatabaseForGuild(guildId: string): Promise<IDatabase> {
		const databaseString = await this.client.redis.get(`guild:${guildId}`);
		if (databaseString) {
			const parsedDatabase = JSON.parse(databaseString);
			return this.ensureDatabaseStructure(parsedDatabase);
		}

		const guild = await this.client.guilds.fetch(guildId, true);
		const databaseFromPrisma = await this.client.prisma.guild.findFirst({ where: { id: guild.id } });

		const database: IDatabase = databaseFromPrisma
			? this.ensureDatabaseStructure(databaseFromPrisma)
			: {
				uuid: guild.id,
				id: guild.id,
				name: guild.name,
				roomid: "0",
				lang: "en",
				room: { id: "0", message: "0" },
			};

		await this.client.redis.set(`guild:${this.client.me.id}:${guild.id}`, JSON.stringify(database));
		return database;
	}

	private ensureDatabaseStructure(data: any): IDatabase {
		return {
			uuid: data.uuid || data.id,
			id: data.id,
			name: data.name,
			roomid: data.roomid || "0",
			lang: data.lang || "en",
			room: data.room || { id: "0", message: "0" },
		};
	}

	public async reboot() {
		this.services.clear();
		this.loadedFiles.clear();
		this.debounceTimers.clear();
		await this.load();
	}

	public async load() {
		const servicesDir = path.join(__dirname, "../service");
		const folders = await fs.readdir(servicesDir, { withFileTypes: true });

		for (const folder of folders.filter(dirent => dirent.isDirectory())) {
			const folderPath = path.join(servicesDir, folder.name);
			const files = await fs.readdir(folderPath);

			for (const file of files) {
				await this.loadFile(path.join(folderPath, file));
			}
		}

		this.client.logger.debug(`ServiceLoader: Loaded ${this.getTotalServiceCount()} plugins`);
	}

	private getTotalServiceCount(): number {
		return Array.from(this.services.values()).reduce((total, map) => total + map.size, 0);
	}

	private async loadFile(filePath: string) {
		try {
			delete require.cache[require.resolve(filePath)];
			const { default: service } = await import(filePath);
			service.filePath = filePath;

			const type = this.getServiceType(filePath);
			const serviceMap = this.services.get(type);
			serviceMap.set(service.name, service);

			if (type === 'player') {
				this.client.sakulink.on(service.name, service.execute.bind(service, this.client));
			}

			this.loadedFiles.add(filePath);
			this.client.logger.debug(`Loaded ${type} service: ${service.name}`);
		} catch (error) {
			this.client.logger.error(`Failed to load file: ${filePath}`, error);
		}
	}

	private getServiceType(filePath: string): ServiceType {
		const folderName = path.basename(path.dirname(filePath));
		switch (folderName) {
			case 'commands': return 'commands';
			case 'services': return 'services';
			case 'player': return 'player';
			default: throw new Error(`Unknown service type for path: ${filePath}`);
		}
	}
}

interface ManagerEvents {
	nodeCreate(node: Node): void;
	nodeDestroy(node: Node): void;
	nodeConnect(node: Node): void;
	nodeReconnect(node: Node): void;
	nodeDisconnect(node: Node, reason: { code?: number; reason?: string }): void;
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