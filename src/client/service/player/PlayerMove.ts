import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
<<<<<<< HEAD
import { Player } from "sakulink";
=======
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

const PlayerMove: PlayerExecute = {
	name: "playerMove",
	type: "player",
<<<<<<< HEAD
	async execute(client: UsingClient, player: Player, oldChannel: string, newChannel: string) {
		return Promise.resolve().then(() => client.logger.info(`Player moved from ${oldChannel} to ${newChannel} on ${player.guild}`));
=======
	async execute(client: UsingClient, player, oldChannel, newChannel) {
		return client.logger.info(`Player moved from ${oldChannel} to ${newChannel} on ${player.guild}`);
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
	},
};

export default PlayerMove;