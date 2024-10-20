import { CommandContext, UsingClient } from 'seyfert';
import { PlayCommandOptions } from "@/client/commands/music/play";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { ads_component, ads_image, ads_text } from "@/lib/ad";
import { ServiceExecute } from "@/client/structures/ServiceExecute";

const MusicPlay: ServiceExecute = {
	name: "MusicPlay",
	type: "commands",
	filePath: __filename,
<<<<<<< HEAD
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof PlayCommandOptions>): Promise<void> {
=======
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof PlayCommandOptions>) {
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
		const { guildId, channelId, member } = interaction;
		const t = client.t(database.lang);
		const query = interaction.options["search"];
		let node = interaction.options["node"];
		const voice = await client.cache.voiceStates?.get(member.id, guildId)?.channel();
		if (!voice?.is(["GuildVoice", "GuildStageVoice"]))
			return interaction.editOrReply({
				embeds: [
					{
						color: 0xff0000,
						description: t.play.not_join_voice_channel.get(),
					},
				],
			}) as unknown as void;
		const bot = client.cache.voiceStates?.get(client.me.id, interaction.guildId);
		const selectedNode = client.sakulink.nodes.get(node);
		if (!selectedNode || selectedNode.socket?.readyState !== WebSocket.OPEN) {
			node = client.sakulink.nodes.filter(n => n.socket?.readyState === WebSocket.OPEN).random().options.identifier;
		}
		let player = client.sakulink.players.get(interaction.guildId);
		if (bot && bot.channelId !== voice.id) {
			return interaction.editOrReply({
				embeds: [
					{
						color: 0xff0000,
						description: t.play.not_same_voice_channel.get(),
					},
				],
			}) as unknown as void;
		}
		if (bot && bot.channelId !== voice.id) return;
		if (player && player.node.options.identifier !== node) player.moveNode(node).then().catch(console.error);
		const res = await client.sakulink.search({
			query: query,
			source: "youtube",
		});

		if (!player)
			player = client.sakulink.create({
				guild: interaction.guildId,
				selfDeafen: true,
				selfMute: false,
				voiceChannel: voice.id,
				textChannel: channelId,
				node: node,
			});

		if (player.state !== "CONNECTED") player.connect();
		switch (res.loadType) {
			default:
				{
					if (!player.queue.current || !player) return player.destroy();
				}
				break;
			case "error": {
				if (!player || !player.queue.current) player.destroy();
				return interaction.editOrReply({
					embeds: [
						{
							color: 0xff0000, // Red color
							author: {
								name: `Error Node: ${player.node.options.identifier}`,
								icon_url: client.me.avatarURL(),
							},
							description: `\`\`\`json\n${JSON.stringify(res, null, "  ")}\`\`\``,
						},
					],
				}) as unknown as void
			}
			case "empty": {
				if (!player || !player.queue.current) player.destroy();
				const emptyEmbedJson = {
					color: 0xff0000, // Red color
					description: `\`\`\`${t.play.search_404.get()} ${query}\`\`\``,
				};
				return interaction.editOrReply({
					embeds: [emptyEmbedJson],
				}) as unknown as void
			}
			case "playlist":
				{
					const playlist = res.playlist;
					await interaction.editOrReply({
						components: [ads_component],
						embeds: [
							{
								author: {
									name: `✅ | ${t.play.track_author_name.get()}`,
									icon_url: client.me.avatarURL(),
								},
								title: `\`\`🟢\`\` ${t.play.added_playlist.get()}:  \`${playlist.name}\``,
								color: 0xa861ff, // Purple color
								image: {
									url: ads_image,
								},
								fields: [
									{
										name: t.play.request.get(),
										value: `<@!${interaction.author.id}>`,
										inline: true,
									},
									{
										name: t.play.time.get(),
										value: client.FormatTime(playlist.duration),
										inline: true,
									},
									{
										name: "Sponsor",
										value: ads_text,
										inline: false,
									},
								],
								footer: {
									text: `Node: ${player.node.options.identifier}`,
									icon_url: client.me.avatarURL(),
								},
								timestamp: new Date().toISOString(),
							},
						],
					});
					player.queue.add(res.playlist.tracks);
					if (!player.playing) await player.play();
				}
				break;
			case "track":
				{
					const track = res.tracks[0];
					await interaction.editOrReply({
						components: [ads_component],
						embeds: [
							{
								author: {
									name: `✅ | ${t.play.track_author_name.get()}`,
									icon_url: client.me.avatarURL(),
								},
								title: `\`\`🟢\`\` ${t.play.added_song.get()}:  \`${track.title}\``,
								color: 0xa861ff, // Purple color
								image: {
									url: ads_image,
								},
								fields: [
									{
										name: t.play.request.get(),
										value: `<@!${interaction.author.id}>`,
										inline: true,
									},
									{
										name: t.play.time.get(),
										value: track.isStream ? "🔴 LIVE STREAM" : client.FormatTime(track.duration),
										inline: true,
									},
									{
										name: "Sponsor",
										value: ads_text,
										inline: false,
									},
								],
								footer: {
									text: `Node: ${player.node.options.identifier}`,
									icon_url: client.me.avatarURL(),
								},
								timestamp: new Date().toISOString(),
							},
						],
					});
					player.queue.add(track);
					if (!player.playing) await player.play();
				}
				break;
			case "search": {
				if (!res.tracks || !res.tracks.length) {
					console.error("No tracks found in response:", res);
					await interaction.editOrReply({ content: "No tracks were found." });
					return;
				}
				const track = res.tracks[0];
				if (!track || !track.title || !track.displayThumbnail) {
					console.error("Track or its properties are missing:", track);
					await interaction.editOrReply({ content: "Track information is missing." });
					return;
				}

				player.queue.add(track);

				await interaction.editOrReply({
					components: [ads_component],
					embeds: [
						{
							author: {
								name: `✅ | ${t.play.track_author_name.get()}`,
								icon_url: client.me.avatarURL(),
							},
							title: `\`\`🟢\`\` ${t.play.added_song.get()}:  \`${track.title}\``,
							color: 0xa861ff, // Purple color
							image: {
								url: ads_image,
							},
							fields: [
								{
									name: t.play.request.get(),
									value: `<@!${interaction.author.id}>`,
									inline: true,
								},
								{
									name: t.play.time.get(),
									value: track.isStream ? "🔴 LIVE STREAM" : client.FormatTime(track.duration),
									inline: true,
								},
								{
									name: "Sponsor",
									value: ads_text,
									inline: false,
								},
							],
							footer: {
								text: `Node: ${player.node.options.identifier}`,
								icon_url: client.me.avatarURL(),
							},
							timestamp: new Date().toISOString(),
						},
					],
				});

				if (!player.playing) await player.play();
				break;
			}
		}
	},
};
export default MusicPlay;
