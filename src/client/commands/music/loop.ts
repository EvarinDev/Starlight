import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext, Options, createStringOption } from "seyfert";

export const LoopCommandOptions = {
	type: createStringOption({
		description: "[EN]: Loop the queue | [TH]: วนรายการ",
		required: true,
		choices: [
			{
				name: "Queue",
				value: "queue",
			},
			{
				name: "Track",
				value: "song",
			},
			{
				name: "Off",
				value: "off",
			},
		],
	}),
};

@Declare({
	name: "loop",
	description: "[EN]: Loop the queue | [TH]: วนรายการ",
	contexts: ["Guild"],
})
@Options(LoopCommandOptions)
export default class LoopCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("LoopCommand", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error);
		}
	}
}
