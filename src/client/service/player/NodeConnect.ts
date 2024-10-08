import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "nodeConnect",
	async execute(client, node) {
		return client.logger.info(`Node ${node.options.identifier} connected`);
	},
});
