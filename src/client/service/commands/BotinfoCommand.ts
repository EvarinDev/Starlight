import { ActionRow, CommandContext, StringSelectMenu, SelectMenuInteraction } from "seyfert";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { Embed } from "seyfert";
import os from "os";
import { ServiceExecute } from "@/client/structures/ServiceExecute";

export default new ServiceExecute({
    name: "BotinfoCommand",
    filePath: __filename,
    async execute(client, database: IDatabase, interaction: CommandContext) {
        try {
            const promises = [
                client.cluster.broadcastEval(async (c) => c.cache.guilds.count()),
                client.cluster.broadcastEval(async (c) => {
                    let totalMembers = 0;
                    for (const guild of c.cache.guilds.values().filter((g) => g.memberCount)) {
                        totalMembers += guild.memberCount;
                    }
                    return totalMembers;
                }),
                client.cluster.broadcastEval((c) => c.gateway.latency),
                client.cluster.broadcastEval(() => process.memoryUsage().heapUsed / 1024 / 1024),
            ];
            const results = await Promise.all(promises);
            const totalGuilds = results[0].reduce((a: number, b: number) => a + b, 0);
            const totalUsers = results[1].reduce((a: number, b: number) => a + b, 0);
            const averageMemoryPerCluster = results[3].reduce((a: number, b: number) => a + b, 0) / ((client.cluster.ids as []).length + 1);
            const mainEmbed = new Embed()
                .setColor(0x8e8aff)
                .setAuthor({
                    name: `${client.me?.username} Information Bot ✨`,
                    iconUrl: client.me?.avatarURL(),
                })
                .setThumbnail(`${client.me?.avatarURL()}`)
                .setFooter({
                    text: `🕒 Uptime: ${(client.FormatTime(client.uptime))}`,
                })
                .setDescription(`
                ┊ **ID:** \`${client.me?.id}\`
                ┊ **Username:** \`${client.me?.username}\`
                ┊ **Guild(s):** \`${totalGuilds}\`
                ┊ **Member(s):** \`${totalUsers}\`
                ┊ **Ping:** \`${Math.round(client.gateway.latency)}ms\`
                ┊ **OS:** \`${os.type()} ${os.release()}\`
                ┊ **CPU:** \`${os.cpus()[0].model}\`
                ┊ **CPU Usage:** \`${os.loadavg().map((data) => { return ` ${data.toFixed(2)}` })}\`
                ┊ **Ram:** \`${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB\`
                ┊ **AvgMemory**: \`(${averageMemoryPerCluster.toFixed(2)} MB) | All Usage: ${results[3].reduce((a: number, b: number) => a + b, 0).toFixed(2)} mb\`
                ┊ **API:** \`Starlight ${(await import("../../../../package.json")).version}\`
                ┊ **Node.js:** \`${process.version}\`
                ╰ **Seyfert:** \`v${((await import('../../../../package.json')).dependencies.seyfert)}\`
            `);
            const clusterData = await client.cluster.broadcastEval((c) => {
                const users = () => {
                    let totalMembers = 0;
                    for (const guild of c.cache.guilds.values()) {
                        totalMembers += guild.memberCount;
                    }
                    return totalMembers;
                }
                return {
                    shards: c.cluster.info.SHARD_LIST,
                    id: c.cluster.id,
                    guilds: c.cache.guilds.count(),
                    users: users(),
                    memory: process.memoryUsage().heapUsed,
                    uptime: c.uptime,
                }
            });

            const maxClustersPerPage = 12;
            const totalPages = Math.ceil(clusterData.length / maxClustersPerPage) + 1;

            const createClusterEmbed = async (page: number): Promise<Embed> => {
                if (page === 0) return mainEmbed;

                const start = (page - 1) * maxClustersPerPage;
                const end = Math.min(start + maxClustersPerPage, clusterData.length);
                const clusterInfo = clusterData.slice(start, end);

                const embed = new Embed()
                    .setColor("#8e8aff")
                    .setAuthor({
                        name: `${client.me?.username} Cluster Information ✨`,
                        iconUrl: client.me?.avatarURL() || undefined,
                    })
                    .setFooter({
                        text: `Page ${page} / ${totalPages - 1}`,
                    });

                clusterInfo.forEach((cluster) => {
                    embed.addFields({
                        name: `<:8891bluestar:1267053991473320069> Cluster: ${cluster.id}`,
                        value: `\`\`\`autohotkey\nShards: ${cluster.shards} \nGuilds : ${cluster.guilds}\nUsers : ${cluster.users}\nMemory : ${client.FormatMemory(cluster.memory)}\nUptime: ${(client.FormatTime(cluster.uptime))} \`\`\``,
                        inline: true
                    });
                });

                return embed;
            };
            const createSelectMenu = () => {
                const options = [{
                    label: "Main Page",
                    description: "View the main status page",
                    value: "0",
                }];

                options.push(...Array.from({ length: totalPages - 1 }, (_, i) => ({
                    label: `Page ${i + 1}`,
                    description: `View clusters on page ${i + 1}`,
                    value: `${i + 1}`,
                })));

                return new ActionRow().addComponents(
                    new StringSelectMenu({
                        custom_id: 'clusterPage',
                        placeholder: 'Select a page',
                        options: options
                    })
                );
            };
            const initialClusterEmbed = await createClusterEmbed(0);
            const selectMenu = createSelectMenu();
            let m;
            try {
                m = await interaction.editOrReply({
                    embeds: [initialClusterEmbed],
                    components: [selectMenu],
                }, true);
            } catch (err) {
                console.error(err);
                return;
            }
            const collector = m.createComponentCollector({
                timeout: 60000,
                filter: (i) => i.user.id === interaction.author.id,
            });

            collector.run('clusterPage', async (menuInteraction: SelectMenuInteraction) => {
                const selectedPage = parseInt(menuInteraction.values[0]);
                const updatedClusterEmbed = await createClusterEmbed(selectedPage);

                await menuInteraction.update({
                    embeds: [updatedClusterEmbed],
                    components: [selectMenu],
                });
            });

            collector.run('end', async () => {
                await m.edit({
                    components: [],
                });
            });
        } catch (error) {
            console.error(error);
            await interaction.editOrReply({
                content: 'An error occurred while executing the command.',
                components: [],
            });
        }
    },
});