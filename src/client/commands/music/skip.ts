import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext } from "seyfert";

@Declare({
	name: "skip",
	description: "[EN]: Skip the music | [TH]: ข้ามเพลง",
	contexts: ["Guild"],
})
export default class SkipCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("SkipCommand", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error as Error);
		}
	}
}
