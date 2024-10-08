import { Logger } from "seyfert";
import { Starlight } from "./structures/Starlight";
import { customLogger } from "./structures/utils/Logger";

export const client = new Starlight();
Logger.customize(customLogger);
client.start().then(() => {
	client.uploadCommands();
	client.redis.connect();
});
process.on("unhandledRejection", async (reason, promise) => {
	client.logger.error(`Unhandled Rejection at: ${await promise} reason: ${reason}`);
});
process.on("uncaughtException", (err) => {
	client.logger.error(`Uncaught Exception: ${err.message}`);
});
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
		}
	}
}
