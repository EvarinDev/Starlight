import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "queueEnd",
	async execute(client, player) {
		player.destroy();
		return client.logger.info(`Queue ended on ${player.guild} node: ${player.node.options.identifier}`);
	},
});
