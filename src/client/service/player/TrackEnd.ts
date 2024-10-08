import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { Player } from "sakulink";

export default new PlayerExecute({
	name: "trackEnd",
	async execute(client, player: Player, track, reason) {
		if (reason.reason === "STOPPED") return;
		if (reason.reason === "REPLACED") return;
		if (player.trackRepeat === true) return;
		if (player.queueRepeat === true) return;
		if (player.queue.length > 0 ) return;
		await player.destroy();
		return client.logger.info(`Track ${track.title} ended on ${player.guild} with reason ${reason.reason}`);
	},
});
