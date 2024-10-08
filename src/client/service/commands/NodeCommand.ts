import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { CommandContext } from "seyfert";
import { Node } from "sakulink";
import { stripIndent } from "common-tags";

export default new ServiceExecute({
	name: "NodeCommand",
	filePath: __filename,
	async execute(client, database: IDatabase, interaction: CommandContext) {
		interaction.deferReply();
		await interaction.editOrReply({
			embeds: [
				{
					title: null,
					description: `<:planet:1266771069604462672> **All nodes: [${client.sakulink.nodes.size}]**\n\`\`\`ml\nConnected : ${client.sakulink.nodes.reduce((a, b) => a + b.stats.players, 0)} Room\nPlaying : ${client.sakulink.nodes.reduce((a, b) => a + b.stats.playingPlayers, 0)} Room\n\`\`\``,
					url: null,
					timestamp: new Date().toISOString(),
					color: 0x8e8aff,
					fields: client.sakulink.nodes.map((node: Node) => ({
						name: `**${node.connected ? `\`🟢\`` : `\`🔴\``} ${node.options.identifier}**`,
						value: stripIndent`
						\`\`\`autohotkey
						Connected : ${node.stats.players || 0} Room
						Playing : ${node?.stats.playingPlayers || 0} Room
						CPUUsge : ${(node.stats.cpu.systemLoad * 100 + node.stats.cpu.lavalinkLoad * 100).toFixed(1) || 0.0} %
						RamUsge : ${client.FormatMemory(node.stats.memory.used) || 0.0}
						RamMax : ${client.FormatMemory(node.stats.memory.reservable || 0.0)}
						Uptime : ${client.FormatTime(node.stats.uptime || 0.0)}
						\`\`\``,
						inline: true,
					})),
					thumbnail: null,
					image: null,
					author: {
						name: `${client.me.username} nodes information ✨`,
						url: undefined,
						icon_url: client.me.avatarURL(),
					},
				},
			],
		});
	},
});
