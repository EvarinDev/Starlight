import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';

export const TrackStart: PlayerExecute = {
	name: "trackStart",
	type: "player",
	async execute(client: UsingClient, player, track) {
		return client.logger.info(`Track ${track.title} started on ${player.guild}`);
	},
};

export default TrackStart;