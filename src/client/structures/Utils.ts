import { IDatabase } from "../interfaces/IDatabase";
import { Starlight } from "./Starlight";

export class Utils {
    public constructor(
        private client: Starlight,
    ) {}
    public async GetAds(lang: "en" | "th"): Promise<{
        title: string;
        description: string;
        image?: string;
        url?: string;
    }> {
        const ads = await this.client.prisma.ads.findMany({
            where: {
                lang: lang
            }
        });
        if (ads.length === 0) {
            return {
                title: "No Ads",
                description: "No ads available for this language."
            };
        } else if (ads.length === 1) {
            return {
                title: ads[0].name,
                description: ads[0].description,
                image: ads[0].image,
                url: ads[0].url
            };
        } else {
            const randomAd = ads[Math.floor(Math.random() * ads.length)];
            return {
                title: randomAd.name,
                description: randomAd.description,
                image: randomAd.image,
                url: randomAd.url
            };
        }
    }

}