import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Player } from "sakulink";

const PlayerDestroy: PlayerExecute = {
	name: "playerDestroy",
	type: "player",
	execute(client: UsingClient, player: Player): Promise<void> {
		return Promise.resolve().then(() => client.logger.info(`Player destroyed on ${player.guild} node: ${player.node.options.identifier}`));
	},
};

export default PlayerDestroy;