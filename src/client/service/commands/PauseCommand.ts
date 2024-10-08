import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { CommandContext, InteractionGuildMember } from "seyfert";
import { IDatabase } from "@/client/interfaces/IDatabase";

export default new ServiceExecute({
	name: "PauseCommand",
	filePath: __filename,
	async execute(client, database: IDatabase, interaction: CommandContext) {
		try {
			const member = interaction.member as InteractionGuildMember;
			const t = client.t(database.lang);
			const voice = await client.cache.voiceStates?.get(member!.id, interaction.guildId)?.channel();
			if (!voice?.is(["GuildVoice", "GuildStageVoice"]))
				return interaction.editOrReply({
					embeds: [
						{
							color: 0xff0000,
							description: t.play.not_join_voice_channel.get(),
						},
					],
				});
			let bot = client.cache.voiceStates?.get(client.me.id, interaction.guildId);
			let player = client.sakulink.players.get(interaction.guildId);
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
			await player.pause(true);
			return interaction.editOrReply({
				content: t.play.pause.get(),
			});
		} catch (error) {
			interaction.editOrReply(error);
		}
	},
});
