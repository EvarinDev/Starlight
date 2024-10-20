import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Node } from "sakulink";

const NodeCreate: PlayerExecute = {
	name: "nodeCreate",
	type: "player",
	execute(client: UsingClient, node: Node): Promise<void> {
		return Promise.resolve().then(() => client.logger.info(`Node ${node.options.identifier} created`));
	},
};
export default NodeCreate;