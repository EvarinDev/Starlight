import { ParseClient, ParseLocales } from "seyfert";
import { Starlight } from "./structures/Starlight";
import type English from "./languages/en";

declare module "seyfert" {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface UsingClient extends ParseClient<Starlight> {}
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface DefaultLocale extends ParseLocales<typeof English> {}
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface Process {
			noDeprecation: boolean;
		}
		interface ProcessEnv {
			NODE_ENV: "development" | "production";
			PRODUCTION_TOKEN: string;
			PRODUCTION_REDIS: string;
			DEVELOPMENT_TOKEN: string;
			DEVELOPMENT_REDIS: string;
		}
	}
}