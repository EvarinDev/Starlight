import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
<<<<<<< HEAD
import { Player, WebSocketClosedEvent } from "sakulink";
=======
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

const SocketClosed: PlayerExecute = {
	name: "socketClosed",
	type: "player",
<<<<<<< HEAD
	execute(client: UsingClient, player: Player, payload: WebSocketClosedEvent): Promise<void> {
		return Promise.resolve().then(() => client.logger.warn(`Socket closed on ${player.guild} node: ${player.node.options.identifier} with code ${payload.code} and reason ${payload.reason}`));
=======
	async execute(client: UsingClient, player, payload) {
		return client.logger.warn(`Socket closed on ${player.guild} node: ${player.node.options.identifier} code: ${payload.code} reason: ${payload.reason}`);
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
	},
};
export default SocketClosed;