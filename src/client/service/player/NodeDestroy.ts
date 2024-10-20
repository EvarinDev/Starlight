import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Node } from "sakulink";

const NodeDestroy: PlayerExecute = {
	name: "nodeDestroy",
	type: "player",
	execute(client: UsingClient, node: Node): Promise<void> {
		return Promise.resolve().then(() => client.logger.warn(`Node ${node.options.identifier} destroyed`));
	},
};
export default NodeDestroy;
