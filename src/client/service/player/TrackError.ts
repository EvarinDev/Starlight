import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
<<<<<<< HEAD
import { Player, Track, Exception } from "sakulink";
=======
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

const TrackError: PlayerExecute = {
	name: "trackError",
	type: "player",
<<<<<<< HEAD
	execute(client: UsingClient, player: Player, track: Track, error: { exception: Exception }): Promise<void> {
		return Promise.resolve().then(()=> client.logger.error(`Track ${track.title} error on ${player.guild}: ${error.exception.message} node: ${player.node.options.identifier}`));
=======
	async execute(client: UsingClient, track, player, error) {
		return client.logger.error(`Track ${track.title} error on ${player.guild}: ${error.exception.message} node: ${player.node.options.identifier}`);
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
	},
};

export default TrackError;