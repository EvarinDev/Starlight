import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext } from "seyfert";

@Declare({
	name: "stop",
	description: "[EN]: Stop the music | [TH]: หยุดเพลง",
	contexts: ["Guild"],
})
export default class StopCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("StopCommand", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error);
		}
	}
}
