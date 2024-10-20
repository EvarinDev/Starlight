import { IDatabase } from "@/client/interfaces/IDatabase";
import { ServiceExecute } from "@/client/structures/ServiceExecute";
<<<<<<< HEAD
import { CommandContext, UsingClient } from 'seyfert';
=======
import { CommandContext, InteractionGuildMember, UsingClient } from 'seyfert';
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

const StopCommand: ServiceExecute = {
	name: "StopCommand",
	type: "commands",
	filePath: __filename,
<<<<<<< HEAD
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext): Promise<void> {
=======
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext) {
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
		try {
			const member = interaction.member;
			const t = client.t(database.lang);
			const player = client.sakulink.players.get(interaction.guildId);
			const bot = client.cache.voiceStates?.get(client.me.id, interaction.guildId);
			const voice = await client.cache.voiceStates?.get(member.id, interaction.guildId)?.channel();
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
				await interaction.editOrReply({
					embeds: [
						{
							color: 0xff0000,
							description: t.play.not_same_voice_channel.get(),
						},
					],
				});
				return;
			}
			player.destroy();
			await interaction.editOrReply({
				embeds: [
					{
						color: 0x00ff00,
						description: t.music.stop.get(),
					},
				],
			});
		} catch (error) {
			console.error(error);
		}
	},
};

export default StopCommand;