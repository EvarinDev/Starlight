import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { CommandContext, UsingClient } from 'seyfert';
import { IDatabase } from "@/client/interfaces/IDatabase";

const PauseCommand: ServiceExecute = {
	name: "PauseCommand",
	type: "commands",
	filePath: __filename,
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext): Promise<void> {
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
			player.pause(true);
			interaction.editOrReply({
				content: t.play.pause.get(),
			}).then().catch(console.error);
			return;
		} catch (error) {
			await interaction.editOrReply({ content: (error as Error).message }).then().catch(console.error);
			return;
		}
	},
};

export default PauseCommand;