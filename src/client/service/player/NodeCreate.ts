import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';

const NodeCreate: PlayerExecute = {
	name: "nodeCreate",
	type: "player",
	async execute(client: UsingClient, node) {
		return client.logger.info(`Node ${node.options.identifier} created`);
	},
};
export default NodeCreate;