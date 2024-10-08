import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext, Options, createNumberOption } from "seyfert";

export const VolumeCommandOptions = {
	percent: createNumberOption({
		description: "[EN]: The song you want to play | [TH]: เพลงที่คุณต้องการเล่น",
		required: true,
	}),
};
@Declare({
	name: "volume",
	description: "[EN]: Change the volume | [TH]: เปลี่ยนระดับเสียง",
	contexts: ["Guild"],
})
@Options(VolumeCommandOptions)
export default class VolumeCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("VolumeCommand", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error);
		}
	}
}
