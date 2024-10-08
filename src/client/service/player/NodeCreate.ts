import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "nodeCreate",
	async execute(client, node) {
		return client.logger.info(`Node ${node.options.identifier} created`);
	},
});
