import { InteractionGuildMember, CommandContext } from "seyfert";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { VolumeCommandOptions } from "@/client/commands/music/volume";
import { ServiceExecute } from "@/client/structures/ServiceExecute";

const VolumeCommand: ServiceExecute ={
	name: "VolumeCommand",
	type: "commands",
	filePath: __filename,
	async execute(client, database: IDatabase, interaction: CommandContext<typeof VolumeCommandOptions>) {
		try {
			const percent = interaction.options.percent;
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
			player.setVolume(percent as number);
			return await interaction.editOrReply({
				embeds: [
					{
						color: 0x00ff00,
						description: t.music.volume(percent).get(),
						timestamp: new Date().toISOString(),
					},
				],
			});
		} catch (error) {
			interaction.editOrReply(error);
			return error;
		}
	},
};

export default VolumeCommand;