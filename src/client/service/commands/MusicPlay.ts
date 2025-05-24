import { ActionRow, Button, CommandContext, UsingClient } from 'seyfert';
import { PlayCommandOptions } from "@/client/commands/music/play";
import { IDatabase } from "@/client/interfaces/IDatabase";
import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { ButtonStyle } from 'seyfert/lib/types';

const MusicPlay: ServiceExecute = {
	name: "MusicPlay",
	type: "commands",
	filePath: __filename,
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof PlayCommandOptions>): Promise<void> {
		// Define buildActionRow as a local function
		function buildActionRow(label1: string, url1: string, emoji1: string, label2: string, url2: string, emoji2: string): ActionRow<Button> {
			const row = new ActionRow<Button>();

			// Add first button if URL is valid
			if (url1 && typeof url1 === 'string' && url1.startsWith('http')) {
				row.addComponents([
					new Button()
						.setLabel(label1)
						.setStyle(ButtonStyle.Link)
						.setURL(url1)
						.setEmoji(emoji1)
				]);
			}

			// Add second button if URL is valid
			if (url2 && typeof url2 === 'string' && url2.startsWith('http')) {
				row.addComponents([
					new Button()
						.setLabel(label2)
						.setStyle(ButtonStyle.Link)
						.setURL(url2)
						.setEmoji(emoji2)
				]);
			}

			return row;
		};
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

		// Safely get ad with fallback
		let ad;
		try {
			ad = await client.utils.GetAds(database.lang as "en" | "th");
			// Validate ad object
			if (!ad || !ad.url || !ad.title || !ad.image) {
				console.warn("Invalid ad data, using fallback values");
				ad = {
					title: "Support Us",
					url: "https://discord.gg/anantix",
					image: "https://r2.anantix.network/assets/img/frame95.png"
				};
			}
		} catch (error) {
			console.error("Error fetching ad:", error);
			ad = {
				title: "Support Us",
				url: "https://discord.gg/anantix",
				image: "https://r2.anantix.network/assets/img/frame95.png"
			};
		}

		let player = client.lithiumx.players.get(interaction.guildId);
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
		// Remove redundant check
		if (player && player.node.options.identifier !== node) player.moveNode(node).then().catch(console.error);
		const res = await client.lithiumx.search(query);

		if (!player)
			player = client.lithiumx.create({
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
				break; case "error": {
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
						components: [buildActionRow(t.play.playlist.get(), query, "📃", ad.title, ad.url, "💰")],
						embeds: [
							{
								author: {
									name: `✅ | ${t.play.track_author_name.get()}`,
									icon_url: client.me.avatarURL(),
								},
								title: `\`\`🟢\`\` ${t.play.added_playlist.get()}:  \`${playlist.name}\``,
								color: 0xa861ff, // Purple color
								image: {
									url: ad.image,
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
										value: ad.title,
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
					if (!player.queue || !player.queue.current) {
						player.queue.add(res.playlist.tracks)
						await player.play()
					} else {
						player.queue.add(res.playlist.tracks)
					}
				}
				break;
			case "track":
				{
					const track = res.tracks[0];
					await interaction.editOrReply({
						components: [buildActionRow(t.play.track.get(), track.uri, "🎵", ad.title, ad.url, "💰")],
						embeds: [
							{
								author: {
									name: `✅ | ${t.play.track_author_name.get()}`,
									icon_url: client.me.avatarURL(),
								},
								title: `\`\`🟢\`\` ${t.play.added_song.get()}:  \`${track.title}\``,
								color: 0xa861ff, // Purple color
								image: {
									url: ad.image,
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
										value: ad.title,
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
					if (!player.queue || !player.queue.current) {
						player.queue.add(track)
						await player.play()
					} else {
						player.queue.add(track)
					}
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
					components: [buildActionRow(t.play.track.get(), track.uri, "🎵", ad.title, ad.url, "💰")],
					embeds: [
						{
							author: {
								name: `✅ | ${t.play.track_author_name.get()}`,
								icon_url: client.me.avatarURL(),
							},
							title: `\`\`🟢\`\` ${t.play.added_song.get()}:  \`${track.title}\``,
							color: 0xa861ff, // Purple color
							image: {
								url: ad.image,
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
									value: ad.title,
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
				if (!player.queue || !player.queue.current) {
					await player.play()
				}
				break;
			}
		}
	},
};

export default MusicPlay;

