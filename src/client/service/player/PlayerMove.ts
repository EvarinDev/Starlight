import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Player } from "sakulink";

const PlayerMove: PlayerExecute = {
	name: "playerMove",
	type: "player",
	async execute(client: UsingClient, player: Player, oldChannel: string, newChannel: string) {
		return Promise.resolve().then(() => client.logger.info(`Player moved from ${oldChannel} to ${newChannel} on ${player.guild}`));
	},
};

export default PlayerMove;