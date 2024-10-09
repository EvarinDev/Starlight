import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { CommandContext, Embed } from "seyfert";
import { LoopCommandOptions } from "@/client/commands/music/loop";
import { ads_component, ads_image, ads_text } from "@/lib/ad";

const LoopCommand: ServiceExecute = {
	name: "LoopCommand",
	type: "commands",
	filePath: __filename,
	async execute(client, database: IDatabase, interaction: CommandContext<typeof LoopCommandOptions>) {
		try {
			const player = client.sakulink.players.get(interaction.guildId);
			if (!player) {
				return interaction.editOrReply({
					embeds: [new Embed().setColor("Red").setDescription("There is no song currently playing.")],
				});
			}
			const type = interaction.options.type as "song" | "queue" | "off";

			if (!type)
				return interaction.editOrReply({
					embeds: [
						{
							color: 0xff0000,
							description: "Please specify a loop type.",
						},
					],
				});
			switch (type) {
				case "song": {
					player.setTrackRepeat(true);
					return interaction.editOrReply({
						components: [ads_component],
						embeds: [
							new Embed()
								.setColor("#a861ff")
								.setDescription(`Song loop has been successfully turned ${player.trackRepeat ? "on" : "off"}`)
								.setImage(ads_image)
								.addFields([
									{
										name: "Sponsor",
										value: ads_text,
										inline: false,
									},
								])
								.setTimestamp(),
						],
					});
				}
				case "queue": {
					player.setQueueRepeat(true);
					return interaction.editOrReply({
						components: [ads_component],
						embeds: [
							new Embed()
								.setColor("#a861ff")
								.setDescription(`${player.queueRepeat ? "on" : "off"} Queue loop complete`)
								.setImage(ads_image)
								.addFields([
									{
										name: "Sponsor",
										value: ads_text,
										inline: false,
									},
								])
								.toJSON(),
						],
					});
				}
				case "off": {
					player.setTrackRepeat(false);
					player.setQueueRepeat(false);
					return interaction.editOrReply({
						components: [ads_component],
						embeds: [
							new Embed()
								.setColor("#a861ff")
								.setDescription(`Loop closed successfully.`)
								.setImage(ads_image)
								.addFields([
									{
										name: "Sponsor",
										value: ads_text,
										inline: false,
									},
								])
								.toJSON(),
						],
					});
				}
			}
		} catch (err) {
			console.error(err);
			await interaction.editOrReply({ content: (err as Error).message });
			return err;
		}
	},
};
export default LoopCommand;