import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Track, Player } from "sakulink";

export const TrackStuck: PlayerExecute = {
	name: "trackStuck",
	type: "player",
	execute(client: UsingClient, track: Track, player: Player, threshold: number): Promise<void> {
		return Promise.resolve().then(() => client.logger.warn(`Track ${track.title} stuck on ${player.guild} for ${threshold}ms`));
	},
};

export default TrackStuck;