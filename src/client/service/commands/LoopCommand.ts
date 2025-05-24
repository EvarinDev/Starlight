import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { CommandContext, Embed, UsingClient } from "seyfert";
import { LoopCommandOptions } from "@/client/commands/music/loop";
import config from "@/config";

const LoopCommand: ServiceExecute = {
	name: "LoopCommand",
	type: "commands",
	filePath: __filename,
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof LoopCommandOptions>): Promise<void> {
		try {
			const t = client.t(database.lang);
			const player = client.lithiumx.players.get(interaction.guildId);
			const ad = await client.utils.GetAds(database.lang as "en" | "th");
			if (!player) {
				interaction.editOrReply({
					embeds: [new Embed().setColor("Red").setDescription(t.loop.not_playing.get())],
				}).then().catch(console.error);
				return
			}
			const type = interaction.options.type;

			if (!type) {
				interaction.editOrReply({
					embeds: [
						{
							color: 0xff0000,
							description: t.loop.specify_type.get(),
						},
					],
				}).then().catch(console.error);
				return
			}
			switch (type) {
				case "song": {
					player.setTrackRepeat(true);
					player.setQueueRepeat(false);
					interaction.editOrReply({
						embeds: [
							new Embed()
								.setColor("#a861ff")
								.setDescription(t.loop.loop_song.get())
								.setImage(ad.image)
								.addFields([
									{
										name: "Sponsor",
										value: ad.title,
										inline: false,
									},
								])
								.setTimestamp(),
						],
					}).then().catch(console.error);
					return
				}
				case "queue": {
					player.setTrackRepeat(false);
					player.setQueueRepeat(true);
					interaction.editOrReply({
						embeds: [
							new Embed()
								.setColor("#a861ff")
								.setDescription(t.loop.loop_queue.get())
								.setImage(ad.image)
								.addFields([
									{
										name: "Sponsor",
										value: ad.title,
										inline: false,
									},
								])
								.toJSON(),
						],
					}).then().catch(console.error);
					return
				}
				case "off": {
					player.setTrackRepeat(false);
					player.setQueueRepeat(false);
					interaction.editOrReply({
						embeds: [
							new Embed()
								.setColor("#a861ff")
								.setDescription(`Loop closed successfully.`)
								.setImage(ad.image)
								.addFields([
									{
										name: "Sponsor",
										value: ad.title,
										inline: false,
									},
								])
								.toJSON(),
						],
					}).then().catch(console.error);
					return
				}
			}
		} catch (err) {
			console.error(err);
			await interaction.editOrReply({ content: (err as Error).message }).then().catch(console.error);
			return;
		}
	}
};
export default LoopCommand;
