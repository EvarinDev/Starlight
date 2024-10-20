import { IDatabase } from "@/client/interfaces/IDatabase";
import { CommandContext, UsingClient } from 'seyfert';
import { MoveNodeCommandOptions } from "@/client/commands/music/move-node";
import { ServiceExecute } from "@/client/structures/ServiceExecute";

const MoveNode: ServiceExecute = {
    name: "MoveNode",
	type: "commands",
    filePath: __filename,
    async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof MoveNodeCommandOptions>): Promise<void> {
        try {
			const member = interaction.member;
			const t = client.t(database.lang);
			const voice = await client.cache.voiceStates?.get(member.id, interaction.guildId)?.channel();
			const bot = client.cache.voiceStates?.get(client.me.id, interaction.guildId);
			const player = client.sakulink.players.get(interaction.guildId);
			if (!player) {
				await interaction.editOrReply({
					content: `Error: Not Found`,
				});
				return;
			}
			if (!voice?.is(["GuildVoice", "GuildStageVoice"])) {
				await interaction.editOrReply({
					embeds: [
						{
							color: 0xff0000,
							description: t.play.not_join_voice_channel.get(),
						},
					],
				});
				return;
			}
			if (bot && bot.channelId !== voice.id) {
				interaction.editOrReply({
					embeds: [
						{
							color: 0xff0000,
							description: t.play.not_same_voice_channel.get(),
						},
					],
				}).then().catch(console.error);
				return;
			}
			await player.moveNode(interaction.options["node"]).then().catch(console.error);
			interaction.editOrReply({
				content: t.lang.success.get(),
			}).then().catch(console.error);
			return;
		} catch (error) {
			interaction.editOrReply({ content: (error as Error).message }).then().catch(console.error);
			return
		}
    },
}
export default MoveNode;