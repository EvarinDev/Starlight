import { PlayerExecute } from "@/client/structures/ServiceExecute";

const NodeConnect: PlayerExecute = {
	name: "nodeConnect",
	type: "player",
	async execute(client, node) {
		return client.logger.info(`Node ${node.options.identifier} connected`);
	},
};
export default NodeConnect;