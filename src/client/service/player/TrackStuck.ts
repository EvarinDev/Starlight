import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
<<<<<<< HEAD
import { Track, Player } from "sakulink";
=======
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

export const TrackStuck: PlayerExecute = {
	name: "trackStuck",
	type: "player",
<<<<<<< HEAD
	execute(client: UsingClient, track: Track, player: Player, threshold: number): Promise<void> {
		return Promise.resolve().then(() => client.logger.warn(`Track ${track.title} stuck on ${player.guild} for ${threshold}ms`));
=======
	async execute(client: UsingClient, track, player, threshold) {
		return client.logger.warn(`Track ${track.title} stuck on ${player.guild} with threshold ${threshold}`);
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
	},
};

export default TrackStuck;