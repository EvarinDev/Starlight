import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';

const SocketClosed: PlayerExecute = {
	name: "socketClosed",
	type: "player",
	async execute(client: UsingClient, player, payload) {
		return client.logger.warn(`Socket closed on ${player.guild} node: ${player.node.options.identifier} code: ${payload.code} reason: ${payload.reason}`);
	},
};
export default SocketClosed;