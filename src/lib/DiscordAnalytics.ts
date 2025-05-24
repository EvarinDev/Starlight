import { Guild, WorkerClient } from "seyfert";
import npmPackageData from "../../package.json";
import { ApiEndpoints, ApplicationCommandType, DiscordAnalyticsOptions, ErrorCodes, InteractionData, InteractionType, Locale, TrackGuildType } from "./utils/types";
/**
 * @class DiscordAnalytics
 * @description The Seyfert class for the DiscordAnalytics library.
 * @param {DiscordAnalyticsOptions} options - Configuration options.
 * @property {any} options.client - The Seyfert client to track events for.
 * @property {string} options.apiToken - The API token for DiscordAnalytics.
 * @property {boolean} options.sharded - Whether the Seyfert client is sharded.
 * @property {boolean} options.debug - Enable or not the debug mode /!\ MUST BE USED ONLY FOR DEVELOPMENT PURPOSES /!\
 * @example
 * const { default: DiscordAnalytics } = require('discord-analytics/seyfert');
 * const { Client } = require('seyfert');
 * const client = new Client({
 *   intents: ["Guilds"]
 * })
 * client.on('ready', () => {
 *   const analytics = new DiscordAnalytics({
 *     client: client,
 *     apiToken: 'YOUR_API_TOKEN'
 *   });
 *   analytics.trackEvents();
 * });
 * client.login('YOUR_BOT_TOKEN');
 *
 * // Check docs for more informations about advanced usages : https://docs.discordanalytics.xyz
 */
export default class DiscordAnalytics {
    // @eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly _client: WorkerClient | any;
    private readonly _apiToken: string;
    private readonly _sharded: boolean = false;
    private readonly _debug: boolean = false
    private readonly _headers: { 'Content-Type': string; Authorization: string; };
    private _isReady: boolean

    constructor(options: DiscordAnalyticsOptions) {
        this._client = options.client;
        this._apiToken = options.apiToken;
        this._headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${this._apiToken}`
        }
        this._sharded = options.sharded || false;
        this._isReady = false
        this._debug = options.debug || false
    }

    /**
     * Initialize DiscordAnalytics on your bot
     * /!\ Advanced users only
     * /!\ Required to use DiscordAnalytics (except if you use the trackEvents function)
     * /!\ Must be used when the client is ready (recommended to use in ready event to prevent problems)
     */
    public async init() {
        fetch(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_SETTINGS_URL.replace(':id', this._client.me.id)}`, {
            headers: this._headers,
            body: JSON.stringify({
                username: this._client.me.username,
                avatar: this._client.me.avatar,
                framework: "seyfert",
                version: npmPackageData.version,
                team: (await this._client.applications?.fetch()).owner
                    ? (await this._client.applications.fetch()).owner.hasOwnProperty("members")
                        ? (await this._client.applications.fetch()).team.members.map((member: any) => member.user.id)
                        : [(await this._client.applications.fetch()).owner.id]
                    : [],
            }),
            method: "PATCH"
        }).then(async (res) => {
            if (res.status === 401) return console.error(ErrorCodes.INVALID_API_TOKEN)
            else if (res.status === 423) return console.error(ErrorCodes.SUSPENDED_BOT)
            else if (res.status !== 200) return console.error(ErrorCodes.INVALID_RESPONSE)

            if (this._debug) console.debug("[DISCORDANALYTICS] Instance successfully initialized")
            this._isReady = true

            if (this._debug) {
                if (process.argv[2] === "--dev") console.debug("[DISCORDANALYTICS] DevMode is enabled. Stats will be sent every 30s.")
                else console.debug("[DISCORDANALYTICS] DevMode is disabled. Stats will be sent every 5min.")
            }

            setInterval(async () => {
                if (this._debug) console.debug("[DISCORDANALYTICS] Sending stats...")

                let guildCount = this._sharded ?
                    0 : // Sharding not implemented for Seyfert
                    this._client.cache.guilds.values().length;

                let userCount = this._sharded ?
                    0 : // Sharding not implemented for Seyfert
                    Array.from(this._client.cache.guilds.values()).reduce((a, g: any) => a + (g.memberCount || 0), 0);

                fetch(`${ApiEndpoints.BASE_URL}${ApiEndpoints.EDIT_STATS_URL.replace(':id', this._client.me.id)}`, {
                    headers: this._headers,
                    body: JSON.stringify(this.statsData),
                    method: "POST"
                }).then(async (res) => {
                    if (res.status === 401) return console.error(ErrorCodes.INVALID_API_TOKEN)
                    else if (res.status === 423) return console.error(ErrorCodes.SUSPENDED_BOT)
                    else if (res.status !== 200) return console.error(ErrorCodes.INVALID_RESPONSE)
                    if (res.status === 200) {
                        if (this._debug) console.debug(`[DISCORDANALYTICS] Stats ${JSON.stringify(this.statsData)} sent to the API`)

                        this.statsData = {
                            date: new Date().toISOString().slice(0, 10),
                            guilds: guildCount,
                            users: userCount as number,
                            interactions: [],
                            locales: [],
                            guildsLocales: [],
                            guildMembers: await this.calculateGuildMembersRepartition(),
                            guildsStats: [],
                            addedGuilds: 0,
                            removedGuilds: 0,
                            users_type: {
                                admin: 0,
                                moderator: 0,
                                new_member: 0,
                                other: 0,
                                private_message: 0
                            }
                        }
                    }
                }).catch(e => {
                    if (this._debug) {
                        console.debug("[DISCORDANALYTICS] " + ErrorCodes.DATA_NOT_SENT);
                        console.error(e)
                    }
                });
            }, process.argv[2] === "--dev" ? 30000 : 5 * 60000);
        })
    }

    private statsData = {
        date: new Date().toISOString().slice(0, 10),
        guilds: 0,
        users: 0,
        interactions: [] as InteractionData[],
        locales: [] as { locale: Locale, number: number }[],
        guildsLocales: [] as { locale: Locale, number: number }[],
        guildMembers: {
            little: 0,
            medium: 0,
            big: 0,
            huge: 0
        },
        guildsStats: [] as { guildId: string, name: string, icon: string | undefined, members: number, interactions: number }[],
        addedGuilds: 0,
        removedGuilds: 0,
        users_type: {
            admin: 0,
            moderator: 0,
            new_member: 0,
            other: 0,
            private_message: 0
        }
    }

    private async calculateGuildMembersRepartition(): Promise<{ little: number, medium: number, big: number, huge: number }> {
        const res = {
            little: 0,
            medium: 0,
            big: 0,
            huge: 0
        }

        let guildsMembers: number[] = []

        if (!this._sharded) guildsMembers = Array.from(this._client.cache.guilds.values()).map((guild: Guild) => guild.memberCount)
        else guildsMembers = [] // Sharding not implemented for Seyfert

        for (const guild of guildsMembers) {
            if (guild <= 100) res.little++
            else if (guild > 100 && guild <= 500) res.medium++
            else if (guild > 500 && guild <= 1500) res.big++
            else if (guild > 1500) res.huge++
        }

        return res
    }

    /**
     * Track interactions
     * /!\ Advanced users only
     * /!\ You need to initialize the class first
     * @param interaction - BaseInteraction class and its extensions only
     */
    public async trackInteractions(interaction: any) {
        if (this._debug) console.log("[DISCORDANALYTICS] trackInteractions() triggered")
        if (!this._isReady) throw new Error(ErrorCodes.INSTANCE_NOT_INITIALIZED)

        let guilds: { locale: Locale, number: number }[] = []
        Array.from(this._client.cache.guilds.values()).forEach((current: any) => guilds.find((x) => x.locale === current.preferredLocale) ?
            ++guilds.find((x) => x.locale === current.preferredLocale)!.number :
            guilds.push({ locale: current.preferredLocale, number: 1 }));

        this.statsData.guildsLocales = guilds

        this.statsData.locales.find((x) => x.locale === interaction.locale) ?
            ++this.statsData.locales.find((x) => x.locale === interaction.locale)!.number :
            this.statsData.locales.push({ locale: interaction.locale as Locale, number: 1 });

        if (interaction.isCommand()) {
            const commandType = interaction.command ?
                interaction.command.type === "USER"
                    ? ApplicationCommandType.UserCommand
                    : interaction.command.type === "MESSAGE"
                        ? ApplicationCommandType.MessageCommand
                        : ApplicationCommandType.ChatInputCommand
                : ApplicationCommandType.ChatInputCommand
            this.statsData.interactions.find((x) => x.name === interaction.commandName && x.type === InteractionType.ApplicationCommand && x.command_type === commandType) ?
                ++this.statsData.interactions.find((x) => x.name === interaction.commandName && x.type === InteractionType.ApplicationCommand)!.number :
                this.statsData.interactions.push({ name: interaction.commandName, number: 1, type: InteractionType.ApplicationCommand, command_type: commandType });
        } else if (interaction.isMessageComponent()) {
            this.statsData.interactions.find((x) => x.name === interaction.customId && x.type === InteractionType.MessageComponent) ?
                ++this.statsData.interactions.find((x) => x.name === interaction.customId && x.type === InteractionType.MessageComponent)!.number :
                this.statsData.interactions.push({ name: interaction.customId, number: 1, type: InteractionType.MessageComponent });
        } else if (interaction.isModalSubmit()) {
            this.statsData.interactions.find((x) => x.name === interaction.customId && x.type === InteractionType.ModalSubmit) ?
                ++this.statsData.interactions.find((x) => x.name === interaction.customId && x.type === InteractionType.ModalSubmit)!.number :
                this.statsData.interactions.push({ name: interaction.customId, number: 1, type: InteractionType.ModalSubmit });
        }

        const guildData = this.statsData.guildsStats.find(guild => interaction.guild ? guild.guildId === interaction.guild.id : guild.guildId === "dm")
        if (guildData) this.statsData.guildsStats = this.statsData.guildsStats.filter(guild => guild.guildId !== guildData.guildId)
        this.statsData.guildsStats.push({
            guildId: interaction.guild ? interaction.guild.id : "dm",
            name: interaction.guild ? interaction.guild.name : "DM",
            icon: interaction.guild && interaction.guild.icon ? interaction.guild.icon : undefined,
            interactions: guildData ? guildData.interactions + 1 : 1,
            members: interaction.guild ? interaction.guild.memberCount : 0
        })

        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        let member = interaction.member
        if (!interaction.inGuild()) ++this.statsData.users_type.private_message
        else if (member && member.permissions && member.permissions.has(8n) || member.permissions.has(32n)) ++this.statsData.users_type.admin
        else if (member && member.permissions && member.permissions.has(8192n) || member.permissions.has(2n) || member.permissions.has(4n) || member.permissions.has(4194304n) || member.permissions.has(8388608n) || member.permissions.has(16777216n) || member.permissions.has(1099511627776n)) ++this.statsData.users_type.moderator
        else if (member && member.joinedAt && member.joinedAt > oneWeekAgo) ++this.statsData.users_type.new_member
    }

    /**
     * Track guilds
     * /!\ Advanced users only
     * /!\ You need to initialize the class first
     * @param guild - The Guild instance only
     * @param {TrackGuildType} type - "create" if the event is guildCreate and "delete" if is guildDelete
     */
    public async trackGuilds(guild: any, type: TrackGuildType) {
        if (this._debug) console.log(`[DISCORDANALYTICS] trackGuilds(${type}) triggered`)
        if (type === "create") this.statsData.addedGuilds++
        else this.statsData.removedGuilds++
    }
}