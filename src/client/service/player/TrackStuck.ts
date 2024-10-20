import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';

export const TrackStuck: PlayerExecute = {
	name: "trackStuck",
	type: "player",
	async execute(client: UsingClient, track, player, threshold) {
		return client.logger.warn(`Track ${track.title} stuck on ${player.guild} with threshold ${threshold}`);
	},
};

export default TrackStuck;