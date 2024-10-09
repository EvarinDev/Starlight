import { PlayerExecute } from "@/client/structures/ServiceExecute";

const TrackError: PlayerExecute = {
	name: "trackError",
	type: "player",
	async execute(client, track, player, error) {
		return client.logger.error(`Track ${track.title} error on ${player.guild}: ${error.exception.message} node: ${player.node.options.identifier}`);
	},
};

export default TrackError;