import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "trackStuck",
	async execute(client, track, player, threshold) {
		return client.logger.warn(`Track ${track.title} stuck on ${player.guild} with threshold ${threshold}`);
	},
});
