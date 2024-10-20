import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';

const NodeDisconnect: PlayerExecute ={
	name: "nodeDisconnect",
	type: "player",
	async execute(client: UsingClient, node, reason) {
		return client.logger.warn(`Node ${node.options.identifier} disconnected: ${reason.reason}`);
	},
};
export default NodeDisconnect;
