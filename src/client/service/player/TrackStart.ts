import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "trackStart",
	async execute(client, player, track) {
		return client.logger.info(`Track ${track.title} started on ${player.guild}`);
	},
});
