import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Node } from "sakulink";

const NodeError: PlayerExecute = {
	name: "nodeError",
	type: "player",
	execute(client: UsingClient, node: Node, error: Error): Promise<void> {
		return Promise.resolve().then(() => client.logger.error(`Node ${node.options.identifier} error: ${error.message}`));
	},
};
export default NodeError;
