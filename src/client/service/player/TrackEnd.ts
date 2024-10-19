import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { Player } from "sakulink";
import { UsingClient } from 'seyfert';

export const TrackEnd: PlayerExecute = {
	name: "trackEnd",
	type: "player",
	async execute(client: UsingClient, player: Player, track, reason) {
		if (["STOPPED", "REPLACED"].includes(reason.reason)) return;
		if (player.trackRepeat || player.queueRepeat || player.queue.length > 0) return;
		await player.destroy();
		return client.logger.info(`Track "${track.title}" ended on guild "${player.guild}" with reason: ${reason.reason}`);
	},
};

export default TrackEnd;
