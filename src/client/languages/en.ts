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
		not_playing: "There is no song currently playing.",
		not_found: "The song was not found.",
		playlist: "Playlist",
		track: "Track",
	},
	loop: {
		not_playing: "There is no song currently playing.",
		specify_type: "Please specify a loop type.",
		loop_song: "Song loop has been successfully turnned on.",
		loop_queue: "On Queue loop complete",
		loop_off: "Loop closed successfully.",
	},
	filter: {
		specify_filter: "Please specify a filter.",
		filter_not_found: "The filter was not found.",
		filter_already: "The filter is already enabled.",
		filter_cleared: "The filter has been successfully cleared.",
		filter_success: (name: string) => `The filter ${name} has been successfully enabled.`,
		filter_removed: (name: string) => `The filter ${name} has been successfully removed.`,
	}
};
