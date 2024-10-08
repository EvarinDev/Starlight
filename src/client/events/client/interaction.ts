import { createEvent } from "seyfert";

export default createEvent({
	data: { once: false, name: "interactionCreate" },
	run(interaction, client) {
		if (interaction.isChatInput()) {
            if (client.cluster.maintenance) {
                return interaction.editOrReply({
                    content: "The bot is currently under maintenance, please try again later.",
                });
            }
            client.logger.info(`[Commands] ${interaction.user.username} (${interaction.user.id}) Command: ${interaction.data.name}`);
        }
        if (interaction.isAutocomplete()) {
            if (client.cluster.maintenance) {
                return interaction.respond([
                    {
                        name: "Maintenance",
                        value: "The bot is currently under maintenance, please try again later.",
                    }
                ]);
            }
            client.logger.info(`[AutoComplete] ${interaction.user.username} (${interaction.user.id}) Data: ${JSON.stringify((interaction.data.options[0] as { value: string }).value)}`);
        }
	},
});
