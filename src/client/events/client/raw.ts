import { createEvent } from "seyfert";

export default createEvent({
	data: { once: false, name: "raw" },
	run(data, client) {
		client.sakulink.updateVoiceState(data as any);
	},
});
