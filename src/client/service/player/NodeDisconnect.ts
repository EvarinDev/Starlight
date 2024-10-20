import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
<<<<<<< HEAD
import { Node } from "sakulink";
=======
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498

const NodeDisconnect: PlayerExecute ={
	name: "nodeDisconnect",
	type: "player",
<<<<<<< HEAD
	execute(client: UsingClient, node: Node, reason: { reason: string }): Promise<void> {
		return Promise.resolve().then(() => client.logger.warn(`Node ${node.options.identifier} disconnected: ${reason.reason}`));
=======
	async execute(client: UsingClient, node, reason) {
		return client.logger.warn(`Node ${node.options.identifier} disconnected: ${reason.reason}`);
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
	},
};
export default NodeDisconnect;
