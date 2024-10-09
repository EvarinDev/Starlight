import { IDatabase } from "@/client/interfaces/IDatabase";
import { AnyContext } from "seyfert";
import { UsingClient } from "seyfert";
import { ActivityType, GatewayActivityUpdateData } from "seyfert/lib/types";

// Function to update the bot's status periodically
export function UpdateStatus(client: UsingClient) {
    setInterval(() => {
        client.redis.set(
            `${client.me.username}`,
            JSON.stringify({
                client_id: client.me.id,
                nodes: client.sakulink.nodes.map((data) => {
                    return {
                        id: data.options.identifier,
                        player: data.stats.players,
                        cpu: data.stats.cpu.cores,
                        uptime: data.stats.uptime,
                    };
                }),
                cluster: client.cluster.broadcastEval((c) => {
                    const guilds = c.cache.guilds.count();
                    const client_id = c.me.id;
                    const memory = process.memoryUsage().heapUsed;
                    const ping = c.gateway.latency;
                    const uptime = c.uptime;
                    return {
                        cluster_id: c.cluster.id,
                        memory,
                        guilds,
                        users: (() => {
                            let totalMembers = 0;
                            for (const guild of c.cache.guilds.values()) {
                                totalMembers += guild.memberCount;
                            }
                            return totalMembers;
                        })(),
                        client_id,
                        ping,
                        uptime,
                    };
                }),
            }),
        ).then((d) => {
			client.logger.debug("Redis updated:" + d);
		}).catch((e) => {
			client.logger.error("UpdateStatus Error:" + e);
		});
    }, 1000 * 5);
}

// Function to dump guild information for a new database
export async function DumpGuildForNewDB(client: UsingClient) {
    const keys = client.cache.guilds.keys();
    return Promise.all(keys.map(async (key) => {
        const guild = client.cache.guilds.get(key);
        const redisGuild = await client.redis.get(`guild:${client.me.id}:${guild.id}`) as unknown as IDatabase;
        if (redisGuild && guild.id === redisGuild.id) return;
        const db = await client.prisma.guild.create({
            data: {
                id: guild.id,
                lang: "en",
                name: guild.name,
                room: { create: { id: "" } },
                ai: { create: { name: "", channel: "" } },
            },
            select: {
                uuid: true,
                roomid: true,
                id: true,
                lang: true,
                name: true,
                room: { select: { id: true, message: true } },
                ai: { select: { name: true, channel: true } },
            },
        });

        await client.redis.set(`guild:${client.me.id}:${guild.id}`, JSON.stringify(db));
    }));
}

// Function to dump existing guild information into Redis
export async function DumpGuild(client: UsingClient) {
    const guilds = await client.prisma.guild.findMany();
    return Promise.all(guilds.map(async (guild) => {
        await client.redis.set(`guild:${client.me.id}:${guild.id}`, JSON.stringify(guild));
    }));
}

// Function to clear all cached data in Redis
export async function ClearCache(client: UsingClient) {
    const keys = await client.redis.keys("*");
    return Promise.all(keys.map(async (key) => {
        await client.redis.del(key);
    }));
}

// Activities for the bot to display
export const BOT_ACTIVITIES: GatewayActivityUpdateData[] = [
    { name: "with {users} users. 🎧", type: ActivityType.Listening },
    { name: "in {guilds} guilds. ❤️", type: ActivityType.Streaming },
    { name: "with {users} users. 👤", type: ActivityType.Playing },
    { name: "{players} players. 🌐", type: ActivityType.Watching },
];

// Error handling function
export async function ErrorRequest(ctx: AnyContext, error: Error) {
    ctx.client.logger.error(error);
    return ctx.interaction.editOrReply({
        embeds: [
            {
                color: 0xff0000,
                title: "An error occurred while executing the command. Contact the Discord Support [here](https://discord.gg/AquariumQStudio)",
                author: {
                    name: `Error Code: ${(error).name || "Unknown"}`,
                    icon_url: ctx.client.me.avatarURL(),
                },
                description: `\`\`\`json\n${(error).message || String(error)}\`\`\``,
            },
        ],
    });
}