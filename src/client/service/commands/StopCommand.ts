import { IDatabase } from "@/client/interfaces/IDatabase";
import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { CommandContext, InteractionGuildMember } from "seyfert";

export default new ServiceExecute({
	name: "StopCommand",
	filePath: __filename,
	async execute(client, database: IDatabase, interaction: CommandContext) {
		try {
			const member = interaction.member as InteractionGuildMember;
			const t = client.t(database.lang);
			const player = client.sakulink.players.get(interaction.guildId);
			let bot = client.cache.voiceStates?.get(client.me.id, interaction.guildId);
			const voice = await client.cache.voiceStates?.get(member!.id, interaction.guildId)?.channel();
			if (!player)
				return interaction.editOrReply({
					content: `Error: Not Found`,
				});
			if (!voice?.is(["GuildVoice", "GuildStageVoice"]))
				return interaction.editOrReply({
					embeds: [
						{
							color: 0xff0000,
							description: t.play.not_join_voice_channel.get(),
						},
					],
				});
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
			await player.destroy();
			return interaction.editOrReply({
				embeds: [
					{
						color: 0x00ff00,
						description: t.music.stop.get(),
					},
				],
			});
		} catch (error) {
			return error;
		}
	},
});
