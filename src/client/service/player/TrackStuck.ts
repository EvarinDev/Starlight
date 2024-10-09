import { PlayerExecute } from "@/client/structures/ServiceExecute";

export const TrackStuck: PlayerExecute = {
	name: "trackStuck",
	type: "player",
	async execute(client, track, player, threshold) {
		return client.logger.warn(`Track ${track.title} stuck on ${player.guild} with threshold ${threshold}`);
	},
};

export default TrackStuck;