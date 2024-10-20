import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Player } from "sakulink";

export const PlayerDisconnect: PlayerExecute = {
	name: "playerDisconnect",
	type: "player",
	async execute(client: UsingClient, player: Player, channel: string) {
		return Promise.resolve().then(() => client.logger.warn(`Player disconnected on ${player.guild} node: ${player.node.options.identifier} channel: ${channel}`));
	},
};

export default PlayerDisconnect;