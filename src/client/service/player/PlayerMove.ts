import { PlayerExecute } from "@/client/structures/ServiceExecute";

const PlayerMove: PlayerExecute = {
	name: "playerMove",
	type: "player",
	async execute(client, player, oldChannel, newChannel) {
		return client.logger.info(`Player moved from ${oldChannel} to ${newChannel} on ${player.guild}`);
	},
};

export default PlayerMove;