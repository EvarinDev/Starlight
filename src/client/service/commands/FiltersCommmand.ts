import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { UsingClient, CommandContext, Embed } from 'seyfert';
import { IDatabase } from "@/client/interfaces/IDatabase";
import { FiltersCommandOptions } from "@/client/commands/music/Filters";
import { Filters, LithiumXPlayer, } from "lithiumx";

const FiltersCommmand: ServiceExecute = {
    name: "FiltersCommmand",
    type: "commands",
    filePath: __filename,
    async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof FiltersCommandOptions>): Promise<void> {
        const player: LithiumXPlayer = client.lithiumx.players.get(interaction.guildId);
        const filter = interaction.options.filter
        let mode = interaction.options.mode;
        if (typeof mode === "undefined") mode = true;
        const t = client.t(database.lang);
        const ad = await client.utils.GetAds(database.lang as "en" | "th");
        if (!player) {
            interaction.editOrReply({
                embeds: [new Embed().setColor("Red").setDescription(t.loop.not_playing.get())],
            }).then().catch(console.error);
            return
        }
        if (!filter) {
            interaction.editOrReply({
                embeds: [
                    {
                        color: 0xff0000,
                        description: t.loop.specify_type.get(),
                    },
                ],
            }).then().catch(console.error);
            return
        }
        const filters = new Filters(player);
        if (filter === "clear") {
            await filters.clearFilters();
            interaction.editOrReply({
                embeds: [
                    new Embed()
                        .setColor("#a861ff")
                        .setDescription(t.filter.filter_cleared.get())
                        .setImage(ad.image)
                        .addFields([
                            {
                                name: "Sponsor",
                                value: ad.title,
                                inline: false,
                            },
                        ])
                        .setTimestamp(),
                ],
            }).then().catch(console.error);
            return
        }
        switch (mode) {
            case true: {
                await filters.setFilter(filter, true);
                interaction.editOrReply({
                    embeds: [
                        new Embed()
                            .setColor("#a861ff")
                            .setDescription(t.filter.filter_success(filter).get())
                            .setImage(ad.image)
                            .addFields([
                                {
                                    name: "Sponsor",
                                    value: ad.title,
                                    inline: false,
                                },
                            ])
                            .setTimestamp(),
                    ],
                }).then().catch(console.error);
                return
            }
            case false: {
                await filters.setFilter(filter, false);
                interaction.editOrReply({
                    embeds: [
                        new Embed()
                            .setColor("#a861ff")
                            .setDescription(t.filter.filter_removed(filter).get())
                            .setImage(ad.image)
                            .addFields([
                                {
                                    name: "Sponsor",
                                    value: ad.title,
                                    inline: false,
                                },
                            ])
                            .setTimestamp(),
                    ],
                }).then().catch(console.error);
                return
            }
            default: {
                interaction.editOrReply({
                    embeds: [
                        {
                            color: 0xff0000,
                            description: t.filter.filter_not_found.get(),
                        },
                    ],
                }).then().catch(console.error);
                return
            }
        }
    },
}

export default FiltersCommmand;