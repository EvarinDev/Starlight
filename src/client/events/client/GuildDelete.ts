import { IDatabase } from "@/client/interfaces/IDatabase";
import { createEvent } from "seyfert";

export default createEvent({
	data: { once: true, name: "guildCreate" },
	async run(guild, client) {
		client.logger.info(`Attempting to delete guild ${guild.name}(${guild.id})`);
        const databaseString: string | null = await client.redis.get(`guild:${client.me.id}:${guild.id}`);
        const database: IDatabase = databaseString
            ? (JSON.parse(databaseString) as IDatabase)
            : await client.prisma.guild.findFirst({
                    where: {
                        id: guild.id,
                    },
                    select: {
                        uuid: true,
                        id: true,
                        name: true,
                        roomid: true,
                        room: {
                            select: {
                                id: true,
                                message: true,
                                uuid: true,
                            },
                        },
                        ai: {
                            select: {
                                name: true,
                                channel: true,
                            },
                        },
                        lang: true,
                    },
                }) as IDatabase;
        const existingGuild = await client.prisma.guild.findUnique({
            where: {
				uuid: database.uuid,
                id: guild.id,
            },
        });
		if (existingGuild) {
			await client.prisma.guild.delete({
				where: {
					uuid: existingGuild.uuid,
					id: existingGuild.id,
				},
			});
			await client.prisma.room.delete({
				where: {
					uuid: database.room.uuid,
					id: database.room.id,
				},
			});
			return await client.redis
				.del(`guild:${client.me.id}:${guild.id}`)
				.then(() => {
					client.logger.info(`Deleted guild ${guild.name}(${guild.id}) from the database`);
				})
				.catch((error: Error) => {
					client.logger.error(`Error deleting guild ${guild.name}(${guild.id}): ${error.message}`);
				});
		} else {
			return client.logger.warn(`Guild ${guild.name}(${guild.id}) not found in the database, skipping deletion.`);
		}
	},
});
