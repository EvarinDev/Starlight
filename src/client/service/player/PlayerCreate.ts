import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "playerCreate",
	async execute(client, player) {
		return client.logger.info(`Player ${player.guild} created`);
	},
});
