import { Logger } from "seyfert";
import { Starlight } from "./structures/Starlight";
import { customLogger } from "./structures/utils/Logger";

export const client = new Starlight();
Logger.customize(customLogger);
client.start().then(() => {
	client.uploadCommands().then(() => {
		client.logger.info("Commands uploaded");
	}).catch((err) => {
		client.logger.error(err);
	});
	//client.redis.connect();
}).catch((err) => {
	client.logger.error(err);
});
process.on("unhandledRejection", (reason, promise) => {
    (async () => {
        try {
            const result = await promise;
            client.logger.error(`Unhandled Rejection at: ${JSON.stringify(result)} reason: ${String(reason)}`);
        } catch (err: unknown) {
            if (err instanceof Error) {
                client.logger.error(`Unhandled Rejection at: ${String(promise)} reason: ${String(reason)}`);
            } else {
                client.logger.error(`Unhandled Rejection at: ${String(promise)} reason: ${String(reason)}`);
            }
        }
    })().catch((err: unknown) => {
        if (err instanceof Error) {
            client.logger.error(`Error in unhandledRejection handler: ${err.message}`);
        } else {
            client.logger.error(`Error in unhandledRejection handler: ${String(err)}`);
        }
    });
});

process.on("uncaughtException", (err: Error) => {
    client.logger.error(`Uncaught Exception: ${err.message}`);
});