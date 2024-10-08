import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { CommandContext } from "seyfert";
import { ChannelType, PermissionFlagsBits } from "seyfert/lib/types";

export default new ServiceExecute({
    name: "SetupCommand",
    filePath: __filename,
    async execute(client, database: IDatabase, interaction: CommandContext) {
        if (!interaction.guildId) return;
        const t = client.t(database.lang).get();
        if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            await interaction.guild().channels.create({
                name: `🎶 | ${client.me.name}`,
                type: ChannelType.GuildText,
            }).then(async (channel) => {
                await client.prisma.guild
                .update({
                    where: {
                        uuid: database.uuid,
                        id: interaction.guildId,
                    },
                    data: {
                        room: {
                            update: {
                                id: channel.id,
                            },
                        }
                    },
                })
                .then(async (data) => {
                    await client.redis.set(`guild:${client.me.id}:${data.id}`, JSON.stringify(data));
                    interaction.editOrReply({
                        content: `${t.lang.success}: <#${channel.id}>`,
                    });
                });
            });
        }
    },
})