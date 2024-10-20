import { PlayerExecute } from "@/client/structures/ServiceExecute";
import {UsingClient} from 'seyfert';

const NodeDestroy: PlayerExecute = {
	name: "nodeDestroy",
	type: "player",
	async execute(client: UsingClient, node) {
		return client.logger.warn(`Node ${node.options.identifier} destroyed`);
	},
};
export default NodeDestroy;
