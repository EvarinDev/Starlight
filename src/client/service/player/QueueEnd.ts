import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { UsingClient } from 'seyfert';
import { Player } from "sakulink";

const QueueEnd: PlayerExecute = {
	name: "queueEnd",
	type: "player",
	execute(client: UsingClient, player: Player): Promise<void> {
		return Promise.resolve(
			player.destroy()
		).then(() => {
			client.logger.info(`Queue ended on ${player.guild} node: ${player.node.options.identifier}`);
		});
	},
};

export default QueueEnd;