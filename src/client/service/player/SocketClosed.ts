import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Player, WebSocketClosedEvent } from "sakulink";

const SocketClosed: PlayerExecute = {
	name: "socketClosed",
	type: "player",
	execute(client: UsingClient, player: Player, payload: WebSocketClosedEvent): Promise<void> {
		return Promise.resolve().then(() => client.logger.warn(`Socket closed on ${player.guild} node: ${player.node.options.identifier} with code ${payload.code} and reason ${payload.reason}`));
	},
};
export default SocketClosed;