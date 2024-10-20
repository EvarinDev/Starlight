import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext } from "seyfert";

@Declare({
	name: "nodes",
	description: "[EN]: Show the nodes | [TH]: แสดงโหนด",
})
export default class NodeCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("NodeCommand", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error as Error);
		}
	}
}
