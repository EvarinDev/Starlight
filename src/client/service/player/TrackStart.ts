import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
<<<<<<< HEAD
import { Player, Track } from "sakulink";
=======
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

export const TrackStart: PlayerExecute = {
	name: "trackStart",
	type: "player",
<<<<<<< HEAD
	execute(client: UsingClient, player: Player, track: Track): Promise<void> {
		return Promise.resolve().then(() => client.logger.info(`Track ${track.title} started on ${player.guild} node: ${player.node.options.identifier}`));
=======
	async execute(client: UsingClient, player, track) {
		return client.logger.info(`Track ${track.title} started on ${player.guild}`);
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
	},
};

export default TrackStart;