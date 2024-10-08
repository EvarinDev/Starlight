import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext, createStringOption, AutocompleteInteraction, Options } from "seyfert";


export const MoveNodeCommandOptions = {
	node: createStringOption({
		description: "[EN]: The node you want to play the song | [TH]: โหนดที่คุณต้องการเล่นเพลง",
		required: true,
		autocomplete: async (interaction: AutocompleteInteraction) => {
			const nodes: {
				name: string;
				value: string;
			}[] = interaction.client.sakulink.nodes.map((node) => ({
				name: `${node.options.identifier} - ${node.stats.players} Players`,
				value: node.options.identifier,
			}));
			return await interaction.respond(nodes).catch(() => {});
		},
	}),
};

@Declare({
	name: "move-node",
	description: "[EN]: Move Node | [TH]: ย้ายโหนด",
	contexts: ["Guild"],
})
@Options(MoveNodeCommandOptions)
export default class PauseCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("MoveNode", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error);
		}
	}
}
