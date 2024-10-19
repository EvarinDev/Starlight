import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';

const QueueEnd: PlayerExecute = {
	name: "queueEnd",
	type: "player",
	async execute(client: UsingClient, player) {
		player.destroy();
		return client.logger.info(`Queue ended on ${player.guild} node: ${player.node.options.identifier}`);
	},
};

export default QueueEnd;