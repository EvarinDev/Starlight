import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
<<<<<<< HEAD
import { Node } from "sakulink";
=======
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

const NodeError: PlayerExecute = {
	name: "nodeError",
	type: "player",
<<<<<<< HEAD
	execute(client: UsingClient, node: Node, error: Error): Promise<void> {
		return Promise.resolve().then(() => client.logger.error(`Node ${node.options.identifier} error: ${error.message}`));
=======
	async execute(client: UsingClient, node, error) {
		return client.logger.error(`Node ${node.options.identifier} error: ${error.message}`);
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
	},
};
export default NodeError;
