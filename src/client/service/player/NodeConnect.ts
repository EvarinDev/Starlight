import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Node } from "sakulink";

const NodeConnect: PlayerExecute = {
	name: "nodeConnect",
	type: "player",
	async execute(client: UsingClient, node: Node) {
		return Promise.resolve().then(() => client.logger.info(`Node ${node.options.identifier} connected`));
	},
};
export default NodeConnect;