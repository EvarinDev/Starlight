import { PlayerExecute } from "@/client/structures/ServiceExecute";

const NodeDisconnect: PlayerExecute ={
	name: "nodeDisconnect",
	type: "player",
	async execute(client, node, reason) {
		return client.logger.warn(`Node ${node.options.identifier} disconnected: ${reason.reason}`);
	},
};
export default NodeDisconnect;
