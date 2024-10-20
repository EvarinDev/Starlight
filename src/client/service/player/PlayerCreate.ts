import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';

const PlayerCreate: PlayerExecute = {
	name: "playerCreate",
	type: "player",
	async execute(client: UsingClient, player) {
		return client.logger.info(`Player ${player.guild} created`);
	},
};

export default PlayerCreate;
