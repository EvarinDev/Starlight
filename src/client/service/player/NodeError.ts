import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "nodeError",
	async execute(client, node, error) {
		return client.logger.error(`Node ${node.options.identifier} error: ${error.message}`);
	},
});
