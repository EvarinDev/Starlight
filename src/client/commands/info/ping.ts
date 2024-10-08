import { Declare, Command, type CommandContext } from "seyfert";

@Declare({
	name: "ping",
	description: "Show the ping with discord",
})
export default class PingCommand extends Command {
	async run(ctx: CommandContext) {
		const ping = ctx.client.gateway.latency;

		await ctx.editOrReply({
			content: `The ping is \`${ping}\``,
		});
	}
}
