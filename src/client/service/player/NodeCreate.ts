import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
<<<<<<< HEAD
import { Node } from "sakulink";
=======
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

const NodeCreate: PlayerExecute = {
	name: "nodeCreate",
	type: "player",
<<<<<<< HEAD
	execute(client: UsingClient, node: Node): Promise<void> {
		return Promise.resolve().then(() => client.logger.info(`Node ${node.options.identifier} created`));
=======
	async execute(client: UsingClient, node) {
		return client.logger.info(`Node ${node.options.identifier} created`);
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
	},
};
export default NodeCreate;