import chalk, { ChalkInstance } from "chalk";
import { getInfo } from "discord-hybrid-sharding";
import { Logger } from "seyfert";
import { LogLevels } from "seyfert/lib/common";

function formatMemoryUsage(bytes: number): string {
	const units = ["B", "KB", "MB", "GB", "TB"];
	let i = 0;

	while (bytes >= 1024 && i < units.length - 1) {
		bytes /= 1024;
		i++;
	}

	const shardList = (getInfo()?.SHARD_LIST ?? "N/A").toString();
    return `[RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${bytes.toFixed(2)} ${units[i]}] [${shardList}]`;
}

function addPadding(label: string): string {
	const maxLength = 6;
	const bar = ">";

	const spacesToAdd = maxLength - label.length;
	if (spacesToAdd <= 0) return bar;

	const spaces = " ".repeat(spacesToAdd);

	return spaces + bar;
}

export function customLogger(_this: Logger, level: LogLevels, args: unknown[]): unknown[] {
	const date: Date = new Date();
	const memory: NodeJS.MemoryUsage = process.memoryUsage();

	const label: string = Logger.prefixes.get(level) ?? "---";
	const timeFormat: string = `[${date.toLocaleDateString()} : ${date.toLocaleTimeString()}]`;

	const emojis: Record<LogLevels, string> = {
		[LogLevels.Debug]: "🎩",
		[LogLevels.Error]: "🏮",
		[LogLevels.Info]: "📘",
		[LogLevels.Warn]: "🔰",
		[LogLevels.Fatal]: "💀",
	};

	const colors: Record<LogLevels, ChalkInstance> = {
		[LogLevels.Debug]: chalk.grey,
		[LogLevels.Error]: chalk.red,
		[LogLevels.Info]: chalk.blue,
		[LogLevels.Warn]: chalk.yellow,
		[LogLevels.Fatal]: chalk.red,
	};

	const text = `${chalk.grey(`${timeFormat}`)} [Starlight] ${chalk.grey(formatMemoryUsage(memory.rss))} ${emojis[level]} [${colors[level](label)}] ${addPadding(label)}`;

	return [text, ...args];
}
