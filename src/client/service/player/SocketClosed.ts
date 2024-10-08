import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "socketClosed",
	async execute(client, player, payload) {
		return client.logger.warn(`Socket closed on ${player.guild} node: ${player.node.options.identifier} code: ${payload.code} reason: ${payload.reason}`);
	},
});
