import { PlayerExecute } from "@/client/structures/ServiceExecute";

const NodeError: PlayerExecute = {
	name: "nodeError",
	type: "player",
	async execute(client, node, error) {
		return client.logger.error(`Node ${node.options.identifier} error: ${error.message}`);
	},
};
export default NodeError;
