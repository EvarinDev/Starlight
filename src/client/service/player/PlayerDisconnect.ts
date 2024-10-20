import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
<<<<<<< HEAD
import { Player } from "sakulink";
=======
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

export const PlayerDisconnect: PlayerExecute = {
	name: "playerDisconnect",
	type: "player",
<<<<<<< HEAD
	async execute(client: UsingClient, player: Player, channel: string) {
		return Promise.resolve().then(() => client.logger.warn(`Player disconnected on ${player.guild} node: ${player.node.options.identifier} channel: ${channel}`));
=======
	async execute(client: UsingClient, player, channel) {
		return client.logger.warn(`Player disconnected on ${player.guild} node: ${player.node.options.identifier} channel: ${channel}`);
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
	},
};

export default PlayerDisconnect;