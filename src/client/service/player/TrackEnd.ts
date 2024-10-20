import { PlayerExecute } from "@/client/structures/ServiceExecute";
import { Player, Track } from "sakulink";
import { UsingClient } from 'seyfert';

export const TrackEnd: PlayerExecute = {
	name: "trackEnd",
	type: "player",
	execute(client: UsingClient, player: Player, track: Track, reason: { reason: string }): Promise<void> {
		if (["STOPPED", "REPLACED"].includes(reason.reason)) return;
		if (player.trackRepeat || player.queueRepeat || player.queue.length > 0) return;
		return Promise.resolve(
			player.destroy()
		).then(() => client.logger.info(`Track "${track.title}" ended on guild "${player.guild}" with reason: ${reason.reason}`)).catch(() => null);
	},
};

export default TrackEnd;
