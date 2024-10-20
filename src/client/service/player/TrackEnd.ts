import { PlayerExecute } from "@/client/structures/ServiceExecute";
<<<<<<< HEAD
import { Player, Track } from "sakulink";
=======
import { Player } from "sakulink";
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
import { UsingClient } from 'seyfert';

export const TrackEnd: PlayerExecute = {
	name: "trackEnd",
	type: "player",
<<<<<<< HEAD
	execute(client: UsingClient, player: Player, track: Track, reason: { reason: string }): Promise<void> {
=======
	async execute(client: UsingClient, player: Player, track, reason) {
>>>>>>> f2fb1f0966638451ac44a5488aae1579780ea498
		if (["STOPPED", "REPLACED"].includes(reason.reason)) return;
		if (player.trackRepeat || player.queueRepeat || player.queue.length > 0) return;
		return Promise.resolve(
			player.destroy()
		).then(() => client.logger.info(`Track "${track.title}" ended on guild "${player.guild}" with reason: ${reason.reason}`)).catch(() => null);
	},
};

export default TrackEnd;
