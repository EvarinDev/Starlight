import fs from "fs/promises";
import path from "path";
import { Starlight } from "./Starlight";
import { Node, Player, Track, TrackExceptionEvent, TrackStuckEvent, WebSocketClosedEvent } from "sakulink";
import { CommandContext } from "seyfert";
import { IDatabase } from "../interfaces/IDatabase";
import { $Enums } from "@prisma/client";

type ServiceType = 'commands' | 'services' | 'player';

interface BaseService {
    name: string;
    execute: (...args: unknown[]) => Promise<void>;
    filePath?: string;
}

export interface ServiceExecute extends BaseService {
    type: Exclude<ServiceType, 'player'>;
}

export interface PlayerExecute extends BaseService {
    type: 'player';
    name: keyof EventListenerMap;
}

export class ServiceLoader {
    private services: Map<ServiceType, Map<string, BaseService>> = new Map<ServiceType, Map<string, BaseService>>([
        ['commands', new Map<string, BaseService>()],
        ['services', new Map<string, BaseService>()],
        ['player', new Map<string, BaseService>()]
    ]);
    private loadedFiles: Set<string> = new Set();
    private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor(private client: Starlight) {
        this.watchServices()
            .then(() => this.client.logger.info("Watching services for changes"))
            .catch(error => this.client.logger.error("Failed to watch services:", error));
    }

    private async watchServices(): Promise<void> {
        const servicesDir = path.join(__dirname, "../service");
        try {
            const watcher = fs.watch(servicesDir, { recursive: true });
            for await (const { eventType, filename } of watcher) {
                if (filename && (eventType === "change" || eventType === "rename")) {
                    this.client.logger.info(`Detected change in ${filename}, reloading...`);
                    const filePath = path.join(servicesDir, filename);
                    return this.debounce(filePath, () => this.reloadFile(filePath));
                }
            }
        } catch (error) {
            this.client.logger.error("Error watching services:", error);
        }
    }

    private debounce(filePath: string, callback: () => Promise<void>, delay: number = 100): void {
        const existingTimer = this.debounceTimers.get(filePath);
        if (existingTimer) clearTimeout(existingTimer);
        const timer = setTimeout(() => {
            return async (): Promise<boolean> => {
                await callback().then().catch(console.error);
                return this.debounceTimers.delete(filePath);
            }
        }, delay);

        this.debounceTimers.set(filePath, timer as NodeJS.Timeout);
    }

    private unloadFile(filePath: string): Promise<void> {
        delete require.cache[require.resolve(filePath)];
        this.loadedFiles.delete(filePath);

        for (const [type, serviceMap] of this.services) {
            for (const [name, service] of serviceMap) {
                if (service.filePath === filePath) {
                    serviceMap.delete(name);
                    if (type === 'player' && 'execute' in service && this.isValidManagerEvent(service.name)) {
                        this.client.sakulink.off(service.name, service.execute as EventListenerMap[typeof service.name]);
                    }
                    return Promise.resolve();
                }
            }
        }
        return Promise.resolve();
    }

    private async reloadFile(filePath: string): Promise<void> {
        if (this.loadedFiles.has(filePath)) {
            await this.unloadFile(filePath);
        }
        await this.loadFile(filePath);
    }

    public async execute(name: string, ...args: unknown[]): Promise<void> {
        for (const serviceMap of this.services.values()) {
            const service = serviceMap.get(name);
            if (service) {
                if (args[0] instanceof CommandContext) {
                    const { guildId } = args[0];
                    const database = await this.getDatabaseForGuild(guildId);
                    await args[0].editOrReply({
                        embeds: [{ color: 0x00ff00, description: "Please wait a moment while I process your request ..." }]
                    });
                    return await service.execute(this.client, database, ...args).then(() => {
                        this.client.logger.info(`ServiceLoader: Executed ${service.name} in ${guildId}`);
                    }).catch((error) => {
                        this.client.logger.error(`ServiceLoader: Failed to execute ${service.name} in ${guildId}`, error);
                    });
                } else {
                    return await service.execute(this.client, ...args).then(() => {
                        this.client.logger.info(`ServiceLoader: Executed ${service.name}`);
                    }).catch((error) => {
                        this.client.logger.error(`ServiceLoader: Failed to execute ${service.name}`, error);
                    });
                }
            }
        }
    }

    private async getDatabaseForGuild(guildId: string): Promise<IDatabase> {
        const databaseString = await this.client.redis.get(`guild:${guildId}`);
        if (databaseString) {
            const parsedDatabase = JSON.parse(databaseString) as Partial<IDatabase>;
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
                lang: $Enums.Lang.en,
                room: { id: "0", message: "0" },
            };

        await this.client.redis.set(`guild:${this.client.me.id}:${guild.id}`, JSON.stringify(database));
        return database;
    }

    private ensureDatabaseStructure(data: Partial<IDatabase>): IDatabase {
        return {
            uuid: data.uuid || data.id || '',
            id: data.id || '',
            name: data.name || '',
            roomid: data.roomid || "0",
            lang: data.lang || $Enums.Lang.en,
            room: data.room || { id: "0", message: "0" },
        };
    }

    public async reboot(): Promise<void> {
        this.services.clear();
        this.loadedFiles.clear();
        this.debounceTimers.clear();
        await this.load();
    }

    public async load(): Promise<void> {
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

	private async loadFile(filePath: string): Promise<void> {
		try {
			delete require.cache[require.resolve(filePath)];
			const importedModule = await import(filePath).then().catch(console.error) as { default: BaseService };
			const service = importedModule.default;
			service.filePath = filePath;
	
			const type = this.getServiceType(filePath);
			const serviceMap = this.services.get(type);
			if (serviceMap) {
				serviceMap.set(service.name, service);
	
				if (type === 'player' && 'execute' in service) {
					const eventName = service.name as keyof EventListenerMap;
					if (this.isValidManagerEvent(eventName)) {
						const listener = service.execute.bind(service, this.client) as EventListenerMap[typeof eventName];
						// This line may still need an @ts-expect-error directive if there's a mismatch
						// @ts-expect-error This is necessary because the event name may not match the expected types.
						this.client.sakulink.on(eventName, listener);
					} else {
						 
						this.client.logger.warn(`Invalid event name: ${String(eventName)}`);
					}
				}
	
				this.loadedFiles.add(filePath);
				return this.client.logger.debug(`Loaded ${type} service: ${service.name}`);
			}
		} catch (error) {
			return this.client.logger.error(`Failed to load file: ${filePath}`, error);
		}
	}
	
	private isValidManagerEvent(eventName: string): eventName is keyof EventListenerMap {
		return ['nodeCreate', 'nodeDestroy', 'nodeConnect', 'nodeReconnect',
			'nodeDisconnect', 'nodeError', 'nodeRaw', 'playerCreate',
			'playerDestroy', 'queueEnd', 'playerMove', 'playerDisconnect',
			'trackStart', 'trackEnd', 'trackStuck', 'trackError', 'socketClosed']
			.includes(eventName);
	}

    private getServiceType(filePath: string): ServiceType {
        const folderName = path.basename(path.dirname(filePath));
        switch (folderName) {
            case 'commands': return 'commands';
            case 'services': return 'services';
            case 'player': return 'player';
            default:
                throw new Error(`Unknown service type for path: ${filePath}`);
        }
    }
}

type EventListenerMap = {
    nodeCreate?: (node?: Node) => void;
    nodeDestroy?: (node?: Node) => void;
    nodeConnect?: (node?: Node) => void;
    nodeReconnect?: (node?: Node) => void;
    nodeDisconnect?: (node?: Node, reason?: { code?: number; reason?: string }) => void;
    nodeError?: (node?: Node, error?: Error) => void;
    nodeRaw?: (node?: Node, data?: string) => void;
    playerCreate?: (player?: Player) => void;
    playerDestroy?: (player?: Player) => void;
    queueEnd?: (player?: Player) => void;
    playerMove?: (player?: Player, newPosition?: number) => void;
    playerDisconnect?: (player?: Player) => void;
    trackStart?: (player?: Player, track?: Track) => void;
    trackEnd?: (player?: Player, track?: Track) => void;
    trackStuck?: (player?: Player, track?: Track, payload?: TrackStuckEvent) => void;
    trackError?: (player?: Player, track?: Track, payload?: TrackExceptionEvent) => void;
    socketClosed?: (player?: Player, payload?: WebSocketClosedEvent) => void;
};