import { ParseClient, ParseLocales } from "seyfert";
import { Starlight } from "./structures/Starlight";
import type English from "./languages/en";

declare module "seyfert" {
	interface UsingClient extends ParseClient<Starlight> {}
	interface DefaultLocale extends ParseLocales<typeof English> {}
}

declare global {
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