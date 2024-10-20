import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Node } from "sakulink";

const NodeDisconnect: PlayerExecute ={
	name: "nodeDisconnect",
	type: "player",
	execute(client: UsingClient, node: Node, reason: { reason: string }): Promise<void> {
		return Promise.resolve().then(() => client.logger.warn(`Node ${node.options.identifier} disconnected: ${reason.reason}`));
	},
};
export default NodeDisconnect;
