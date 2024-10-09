import { PlayerExecute } from "@/client/structures/ServiceExecute";

export const TrackStart: PlayerExecute = {
	name: "trackStart",
	type: "player",
	async execute(client, player, track) {
		return client.logger.info(`Track ${track.title} started on ${player.guild}`);
	},
};

export default TrackStart;