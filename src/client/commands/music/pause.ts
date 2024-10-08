import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext } from "seyfert";
@Declare({
	name: "pause",
	description: "[EN]: Pause the music | [TH]: หยุดเพลง",
	contexts: ["Guild"],
})
export default class PauseCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("PauseCommand", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error);
		}
	}
}
