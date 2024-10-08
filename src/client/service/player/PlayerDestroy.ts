import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "playerDestroy",
	async execute(client, player) {
		return client.logger.info(`Player destroyed on ${player.guild} node: ${player.node.options.identifier}`);
	},
});
