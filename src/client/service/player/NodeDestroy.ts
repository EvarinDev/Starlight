import { PlayerExecute } from "@/client/structures/ServiceExecute";

const NodeDestroy: PlayerExecute = {
	name: "nodeDestroy",
	type: "player",
	async execute(client, node) {
		return client.logger.warn(`Node ${node.options.identifier} destroyed`);
	},
};
export default NodeDestroy;
