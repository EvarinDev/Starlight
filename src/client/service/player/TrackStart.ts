import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Player, Track } from "sakulink";

export const TrackStart: PlayerExecute = {
	name: "trackStart",
	type: "player",
	execute(client: UsingClient, player: Player, track: Track): Promise<void> {
		return Promise.resolve().then(() => client.logger.info(`Track ${track.title} started on ${player.guild} node: ${player.node.options.identifier}`));
	},
};

export default TrackStart;