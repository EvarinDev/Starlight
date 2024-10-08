export default {
	lang: {
		already: "The bot is already in this language",
		success: "Success",
		song: "song",
	},
	music: {
		stop: "The bot has stopped playing music and left the voice channel.",
		volume: (value: number) => `The volume has been changed to ${value}.`,
		resume: "Resumed",
		skip: "Skipped",
	},
	play: {
		not_join_voice_channel: "Please enter the voice channel before using this command!",
		not_same_voice_channel: "You are not on the same voice channel as the bot!",
		search_404: "No results found!",
		playlist_author_name: "The playlist was successfully added to the queue.",
		track_author_name: "The track has been successfully added to the queue",
		added_song: "Added a song",
		added_playlist: "Added a playlist",
		request: "Request by",
		time: "Time",
		pause: "Paused",
	},
};
