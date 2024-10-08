import { IDatabase } from "@/client/interfaces/IDatabase";
import { CommandContext, InteractionGuildMember } from "seyfert";
import { MoveNodeCommandOptions } from "@/client/commands/music/move-node";
import { ServiceExecute } from "@/client/structures/ServiceExecute";

const MoveNode: ServiceExecute = {
    name: "MoveNode",
	type: "commands",
    filePath: __filename,
    async execute(client, database: IDatabase, interaction: CommandContext<typeof MoveNodeCommandOptions>) {
        try {
			const member = interaction.member;
			const t = client.t(database.lang);
			const voice = await client.cache.voiceStates?.get(member.id, interaction.guildId)?.channel();
			if (!voice?.is(["GuildVoice", "GuildStageVoice"]))
				return interaction.editOrReply({
					embeds: [
						{
							color: 0xff0000,
							description: t.play.not_join_voice_channel.get(),
						},
					],
				});
			const bot = client.cache.voiceStates?.get(client.me.id, interaction.guildId);
			const player = client.sakulink.players.get(interaction.guildId);
			if (!player)
				return interaction.editOrReply({
					content: `Error: Not Found`,
				});
			if (bot && bot.channelId !== voice.id) {
				return interaction.editOrReply({
					embeds: [
						{
							color: 0xff0000,
							description: t.play.not_same_voice_channel.get(),
						},
					],
				});
			}
			await player.moveNode(interaction.options["node"]);
			return interaction.editOrReply({
				content: t.lang.success.get(),
			});
		} catch (error) {
			interaction.editOrReply(error);
			return error;
		}
    },
}
export default MoveNode;