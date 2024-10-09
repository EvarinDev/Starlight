import { PlayerExecute } from "@/client/structures/ServiceExecute";

const PlayerCreate: PlayerExecute = {
	name: "playerCreate",
	type: "player",
	async execute(client, player) {
		return client.logger.info(`Player ${player.guild} created`);
	},
};

export default PlayerCreate;
