import { PlayerExecute } from "@/client/structures/ServiceExecute";
<<<<<<< HEAD
import { UsingClient } from 'seyfert';
import { Node } from "sakulink";
=======
import {UsingClient} from 'seyfert';
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

const NodeDestroy: PlayerExecute = {
	name: "nodeDestroy",
	type: "player",
<<<<<<< HEAD
	execute(client: UsingClient, node: Node): Promise<void> {
		return Promise.resolve().then(() => client.logger.warn(`Node ${node.options.identifier} destroyed`));
=======
	async execute(client: UsingClient, node) {
		return client.logger.warn(`Node ${node.options.identifier} destroyed`);
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
	},
};
export default NodeDestroy;
