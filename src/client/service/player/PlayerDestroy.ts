import { PlayerExecute } from "@/client/structures/ServiceExecute";

const PlayerDestroy: PlayerExecute = {
	name: "playerDestroy",
	type: "player",
	async execute(client, player) {
		return client.logger.info(`Player destroyed on ${player.guild} node: ${player.node.options.identifier}`);
	},
};

export default PlayerDestroy;