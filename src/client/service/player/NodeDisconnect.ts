import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "nodeDisconnect",
	async execute(client, node, reason) {
		return client.logger.warn(`Node ${node.options.identifier} disconnected: ${reason.reason}`);
	},
});
