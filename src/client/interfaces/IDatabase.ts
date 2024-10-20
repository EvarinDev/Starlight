import { $Enums } from "@prisma/client";

export interface IDatabase {
	uuid: string;
	id: string;
	name: string;
	roomid: string;
	lang: $Enums.Lang;
	room: {
		uuid: string;
		id: string;
		message: string;
	};
}
