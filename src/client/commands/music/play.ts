import { ErrorRequest } from "@/client/structures/utils/Client";
import { Declare, Command, type CommandContext, Options, createStringOption, AutocompleteInteraction } from "seyfert";

export const PlayCommandOptions = {
	search: createStringOption({
		description: "[EN]: The song you want to play | [TH]: เพลงที่คุณต้องการเล่น",
		required: true,
		autocomplete: async (interaction: AutocompleteInteraction) => {
			const { client } = interaction;
			let song = interaction.getInput();
			if (!song) {
				const jirayuMusic = (await fetch("https://api.jirayu.net/lavalink/track").then((it) => it.json())) as {
					id: number;
					identifier: string;
					title: string;
					uri: string;
					artworkUrl: string;
					author: string;
					isrc: string | null;
					source: string;
					count: number;
					createdAt: string;
					updatedAt: string;
				}[];

				return interaction
					.respond(jirayuMusic.map((it) => ({ name: it.title, value: it.uri })))
					.then(() => {})
					.catch(() => {});
			}

			const res = await client.sakulink.search({
				query: song,
				source: "youtube",
			});

			const songs: {
				name: string;
				value: string;
			}[] = [];
			switch (res.loadType) {
				case "search":
					for (const track of res.tracks) {
						songs.push({
							name: track.title,
							value: track.title,
						});
					}
					break;
				default:
					break;
			}
			if (songs.length > 0) {
				await interaction
					.respond(songs)
					.then(() => {})
					.catch(() => {});
				songs.pop();
			} else {
				await interaction
					.respond([
						{
							name: "No results found",
							value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
						}
					])
					.then(() => {})
					.catch(() => {});
			}
		},
	}),
	node: createStringOption({
		description: "[EN]: The node you want to play the song | [TH]: โหนดที่คุณต้องการเล่นเพลง",
		required: false,
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
	name: "play",
	description: "[EN]: Play a song | [TH]: เล่นเพลง",
	contexts: ["Guild"],
})
@Options(PlayCommandOptions)
export default class PlayCommand extends Command {
	async run(ctx: CommandContext) {
		try {
			return await ctx.client.services.execute("MusicPlay", ctx);
		} catch (error) {
			return ErrorRequest(ctx, error);
		}
	}
}
