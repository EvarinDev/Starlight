import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "playerMove",
	async execute(client, player, oldChannel, newChannel) {
		return client.logger.info(`Player moved from ${oldChannel} to ${newChannel} on ${player.guild}`);
	},
});
