import { PlayerExecute } from "@/client/structures/ServiceExecute";

export default new PlayerExecute({
	name: "nodeDestroy",
	async execute(client, node) {
		return client.logger.warn(`Node ${node.options.identifier} destroyed`);
	},
});
