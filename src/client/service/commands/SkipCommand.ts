import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { CommandContext, UsingClient } from 'seyfert';
import { IDatabase } from "@/client/interfaces/IDatabase";

const SkipCommand: ServiceExecute = {
	name: "SkipCommand",
	type: "commands",
	filePath: __filename,
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext) {
		try {
			const t = client.t(database.lang);
			const player = client.sakulink.players.get(interaction.guildId);
			const bot = client.cache.voiceStates?.get(client.me.id, interaction.guildId);
			const voice = await client.cache.voiceStates?.get(interaction.member.id, interaction.guildId)?.channel();
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
			await player.stop();
			return interaction.editOrReply({
				embeds: [
					{
						color: 0x00ff00,
						description: t.music.skip.get(),
					},
				],
			});
		} catch (error) {
			return error;
		}
	},
};
export default SkipCommand;
