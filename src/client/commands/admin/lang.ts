import { ErrorRequest } from "@/client/structures/utils/Client";
import { Options } from "seyfert";
import { createStringOption } from "seyfert";
import { Declare, Command, type CommandContext } from "seyfert";

export const LangCommandOptions = {
	language: createStringOption({
		description: "[EN]: Change the language | [TH]: เปลี่ยนภาษา",
		required: true,
		choices: [
			{
				name: "English",
				value: "en",
			},
			{
				name: "Thai",
				value: "th",
			},
		] as const,
	}),
};

@Declare({
	name: "lang",
	description: "[EN]: Change the language | [TH]: เปลี่ยนภาษา",
})
@Options(LangCommandOptions)
export default class LangCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("LangCommand", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error as Error);
		}
	}
}
