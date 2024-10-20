import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';

const NodeError: PlayerExecute = {
	name: "nodeError",
	type: "player",
	async execute(client: UsingClient, node, error) {
		return client.logger.error(`Node ${node.options.identifier} error: ${error.message}`);
	},
};
export default NodeError;
