import { PlayerExecute } from "@/client/structures/ServiceExecute";

const NodeCreate: PlayerExecute = {
	name: "nodeCreate",
	type: "player",
	async execute(client, node) {
		return client.logger.info(`Node ${node.options.identifier} created`);
	},
};
export default NodeCreate;