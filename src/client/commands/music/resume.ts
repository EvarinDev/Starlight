import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext } from "seyfert";

@Declare({
	name: "resume",
	description: "[EN]: Resume the music | [TH]: เล่นเพลงต่อ",
	contexts: ["Guild"],
})
export default class ResumeCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("ResumeCommand", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error as Error);
		}
	}
}
