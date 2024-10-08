import { ParseClient, ParseLocales } from "seyfert";
import { Starlight } from "./structures/Starlight";
import type English from "./languages/en";

declare module "seyfert" {
	interface UsingClient extends ParseClient<Starlight> {}
	interface DefaultLocale extends ParseLocales<typeof English> {}
}