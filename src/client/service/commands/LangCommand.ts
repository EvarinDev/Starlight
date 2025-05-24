import { CommandContext, UsingClient } from 'seyfert';
import { IDatabase } from "@/client/interfaces/IDatabase";
import { PermissionFlagsBits } from "seyfert/lib/types";
import { ServiceExecute } from "@/client/structures/ServiceExecute";
import { LangCommandOptions } from "@/client/commands/admin/lang";

const LangCommand: ServiceExecute = {
	name: "LangCommand",
	type: "commands",
	filePath: __filename,
	async execute(client: UsingClient, database: IDatabase, interaction: CommandContext<typeof LangCommandOptions>) {
		const lang = interaction.options.language;
		const t = client.t(database.lang);
		if (!interaction.guild) return void 0;
		if (interaction.member.permissions.has([PermissionFlagsBits.Administrator])) {
			if (database.lang === lang) {
				return interaction.editOrReply({
					content: `${t.lang.already.get()}`,
				}) as unknown as void;
			}
			const existingGuild = await client.prisma.guild.findFirst({ where: { id: interaction.guildId } });
			if (existingGuild) {
				await client.prisma.guild
					.update({
						where: {
							uuid: database.uuid,
							id: interaction.guildId,
						},
						data: {
							id: interaction.guildId,
							lang: lang,
						},
						select: {
							id: true,
							name: true,
							lang: true,
							room: true,
							uuid: true,
							roomid: true,
						},
					})
					.then(async (data) => {
						await client.redis.set(`guild:${client.me.id}:${data.id}`, JSON.stringify(data));
						interaction.editOrReply({
							content: `${t.lang.success.get()}: ${data.lang}`,
						}).then().catch(console.error);
						return void 0;
					});
			} else {
				await client.prisma.guild
					.create({
						data: {
							id: interaction.guildId,
							lang: lang,
							name: interaction.guild.name,
							room: { create: { id: "" } },
							ai: { create: { name: "", channel: "" } },
						},
						select: {
							uuid: true,
							roomid: true,
							lang: true,
							id: true,
							name: true,
						},
					})
					.then(async (data) => {
						await client.redis.set(`guild:${client.me.id}:${data.id}`, JSON.stringify(data));
						interaction.editOrReply({
							content: `${t.lang.success.get()}: ${data.lang}`,
						}).then().catch(console.error);
						return void 0;
					});
			}
		}
	},
};

export default LangCommand;
