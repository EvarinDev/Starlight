import { PlayerExecute } from "@/client/structures/ServiceExecute";

export const PlayerDisconnect: PlayerExecute = {
	name: "playerDisconnect",
	type: "player",
	async execute(client, player, channel) {
		return client.logger.warn(`Player disconnected on ${player.guild} node: ${player.node.options.identifier} channel: ${channel}`);
	},
};

export default PlayerDisconnect;