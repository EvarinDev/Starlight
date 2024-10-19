import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';

const PlayerDestroy: PlayerExecute = {
	name: "playerDestroy",
	type: "player",
	async execute(client: UsingClient, player) {
		return client.logger.info(`Player destroyed on ${player.guild} node: ${player.node.options.identifier}`);
	},
};

export default PlayerDestroy;