import { IDatabase } from "@/client/interfaces/IDatabase";
import { AnyContext } from "seyfert";
import { UsingClient } from "seyfert";
import { ActivityType, GatewayActivityUpdateData } from "seyfert/lib/types";

export async function UpdateStatus(client: UsingClient) {
	setInterval(async () => {
		return await client.redis.set(
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
				cluster: await client.cluster.broadcastEval(async (c) => {
					const guilds = c.cache.guilds.count();
					const client_id = c.me.id;
					const memory = process.memoryUsage().heapUsed;
					const ping = c.gateway.latency;
					const uptime = c.uptime;
					return {
						cluster_id: c.cluster.id,
						memory,
						guilds,
						users: () => {
							let totalMembers = 0;
							for (const guild of c.cache.guilds.values()) {
								totalMembers += guild.memberCount;
							}
							return totalMembers;
						},
						client_id,
						ping,
						uptime,
					};
				}),
			}),
		);
	}, 1000 * 5);
}

export async function DumpGuildForNewDB(client: UsingClient) {
	return await client.cache.guilds.keys().map(async (key) => {
		let guild = client.cache.guilds.get(key);
		const redisGuild = await client.redis.get(`guild:${client.me.id}:${guild.id}`) as unknown as IDatabase;
		if (redisGuild && guild.id === redisGuild.id) return;
		const db = await client.prisma.guild.create({
			data: {
				id: guild.id,
				lang: "en",
				client_id: client.me.id,
				name: guild.name,
				room: { create: { client_id: client.me.id, id: "" } },
				ai: { create: { client_id: client.me.id, name: "", channel: "" } },
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
	});
}

export async function DumpGuild(client: UsingClient) {
	return await client.prisma.guild.findMany().then(async (guilds) => {
		for (const guild of guilds) {
			await client.redis.set(`guild:${client.me.id}:${guild.id}`, JSON.stringify(guild));
		}
	});
}
export async function ClearCache(client: UsingClient) {
	return await client.redis.keys("*").then(async (keys) => {
		for (const key of keys) {
			await client.redis.del(key);
		}
	});
}

export const BOT_ACTIVITIES: GatewayActivityUpdateData[] = [
	{ name: "with {users} users. 🎧", type: ActivityType.Listening },
	{ name: "in {guilds} guilds. ❤️", type: ActivityType.Streaming },
	{ name: "with {users} users. 👤", type: ActivityType.Playing },
	{ name: "{players} players. 🌐", type: ActivityType.Watching },
];

export async function ErrorRequest(ctx: AnyContext, error: Error | unknown) {
	ctx.client.logger.error(error);
	return ctx.interaction.editOrReply({
		embeds: [
			{
				color: 0xff0000,
				title: "An error occurred while executing the command. Contact the Discord Support [here](https://discord.gg/AquariumQStudio)",
				author: {
					name: `Error Code: ${(error as Error).name || "Unknown"}`,
					icon_url: ctx.client.me.avatarURL(),
				},
				description: `\`\`\`json\n${(error as Error).message || error}\`\`\``,
			},
		],
	});
}
