import c, { StyleFunction } from "ansi-colors";
import { getInfo } from "discord-hybrid-sharding";
import { LogLevels } from "seyfert/lib/common";

export class Logger {
  name: string;

  public constructor(name: string) {
    this.name = name;
  }
  private formatMemoryUsage(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;

    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }

    const shardList = (getInfo()?.SHARD_LIST ?? "N/A").toString();
    return `[RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${bytes.toFixed(2)} ${units[i]}] [${shardList}]`;
  }

  private addPadding(label: string): string {
    const maxLength = 6;
    const bar = ">";

    const spacesToAdd = maxLength - label.length;
    if (spacesToAdd <= 0) return bar;

    const spaces = " ".repeat(spacesToAdd);

    return spaces + bar;
  }

  private prefixes: Map<LogLevels, string> = new Map([
    [LogLevels.Debug, "DEBUG"],
    [LogLevels.Error, "ERROR"],
    [LogLevels.Info, "INFO"],
    [LogLevels.Warn, "WARN"],
    [LogLevels.Fatal, "FATAL"],
  ]);

  private emojis: Record<LogLevels, string> = {
    [LogLevels.Debug]: "🎩",
    [LogLevels.Error]: "🏮",
    [LogLevels.Info]: "📘",
    [LogLevels.Warn]: "🔰",
    [LogLevels.Fatal]: "💀",
  };

  private colors: Record<LogLevels, StyleFunction> = {
    [LogLevels.Debug]: c.grey,
    [LogLevels.Error]: c.red,
    [LogLevels.Info]: c.blue,
    [LogLevels.Warn]: c.yellow,
    [LogLevels.Fatal]: c.red,
  };

  private logMessage(level: LogLevels, ...args: unknown[]): void {
    const date: Date = new Date();
    const memory: NodeJS.MemoryUsage = process.memoryUsage();

    const label: string = this.prefixes.get(level) ?? "---";
    const timeFormat: string = `[${date.toLocaleDateString()} : ${date.toLocaleTimeString()}]`;
    const text = `${c.grey(`${timeFormat}`)} [Starlight: ${this.name}] ${c.grey(this.formatMemoryUsage(memory.rss))} ${this.emojis[level]} [${this.colors[level](label)}] ${this.addPadding(label)}`;
    console.log(text, ...args);
  }

  log(...args: unknown[]): void {
    this.logMessage(LogLevels.Info, ...args);
  }

  info(...args: unknown[]): void {
    this.logMessage(LogLevels.Info, ...args);
  }

  fatal(...args: unknown[]): void {
    this.logMessage(LogLevels.Fatal, ...args);
  }

  warn(...args: unknown[]): void {
    this.logMessage(LogLevels.Warn, ...args);
  }

  debug(...args: unknown[]): void {
    this.logMessage(LogLevels.Debug, ...args);
  }
}