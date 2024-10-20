import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
<<<<<<< HEAD
import { Player } from "sakulink";
=======
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

const PlayerDestroy: PlayerExecute = {
	name: "playerDestroy",
	type: "player",
<<<<<<< HEAD
	execute(client: UsingClient, player: Player): Promise<void> {
		return Promise.resolve().then(() => client.logger.info(`Player destroyed on ${player.guild} node: ${player.node.options.identifier}`));
=======
	async execute(client: UsingClient, player) {
		return client.logger.info(`Player destroyed on ${player.guild} node: ${player.node.options.identifier}`);
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
	},
};

export default PlayerDestroy;