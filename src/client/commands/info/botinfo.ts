import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext } from "seyfert";

@Declare({
	name: "botinfo",
	description: "[EN]: Show the bot information | [TH]: แสดงข้อมูลของบอท",
})
export default class BotinfoCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("BotinfoCommand", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error);
		}
	}
}
