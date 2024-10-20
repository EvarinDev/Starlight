<<<<<<< HEAD
import { CommandContext, UsingClient } from 'seyfert';
=======
import { InteractionGuildMember, CommandContext, UsingClient } from 'seyfert';
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
import { IDatabase } from "@/client/interfaces/IDatabase";
import { VolumeCommandOptions } from "@/client/commands/music/volume";
import { ServiceExecute } from "@/client/structures/ServiceExecute";

const VolumeCommand: ServiceExecute ={
	name: "VolumeCommand",
	type: "commands",
	filePath: __filename,
<<<<<<< HEAD
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof VolumeCommandOptions>): Promise<void> {
=======
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof VolumeCommandOptions>) {
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
		try {
			const percent = interaction.options.percent;
			const member = interaction.member;
			const t = client.t(database.lang);
			const player = client.sakulink.players.get(interaction.guildId);
			const bot = client.cache.voiceStates?.get(client.me.id, interaction.guildId);
			const voice = await client.cache.voiceStates?.get(member.id, interaction.guildId)?.channel();
			if (!player) {
				await interaction.editOrReply({
					content: `Error: Not Found`,
				}).then().catch(console.error);
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
				}).then().catch(console.error);
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
				return
			}
			player.setVolume(percent);
			await interaction.editOrReply({
				embeds: [
					{
						color: 0x00ff00,
						description: t.music.volume(percent).get(),
						timestamp: new Date().toISOString(),
					},
				],
			});
			return
		} catch (error) {
			interaction.editOrReply({
				content: (error as Error).message,
			}).then().catch(console.error);
			console.error(error);
		}
	},
};

export default VolumeCommand;