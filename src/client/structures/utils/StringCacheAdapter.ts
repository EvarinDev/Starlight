import { Adapter } from "seyfert";

export interface MemoryAdapterOptions<T> {
	encode(data: unknown): T;
	decode(data: T): unknown;
}

export class StringCacheAdapter implements Adapter {
	isAsync = false;

	readonly storage = new Map<string, string>();
	readonly relationships = new Map<string, string[]>();

	constructor(
		public options: MemoryAdapterOptions<string> = {
			encode(data: unknown) {
				return JSON.stringify(data);
			},
			decode(data: string) {
				try {
					return JSON.parse(data);
				} catch {
					return data; // Return as-is if it's not JSON
				}
			},
		},
	) {}

	start() {}

	scan(query: string, keys?: false): unknown[];
	scan(query: string, keys: true): string[];
	scan(query: string, keys = false) {
		const values: (string | unknown)[] = [];
		const sq = query.split('.');
		for (const [key, value] of this.storage.entries()) {
			if (key.split('.').every((value, i) => (sq[i] === '*' ? !!value : sq[i] === value))) {
				values.push(keys ? key : this.options.decode(value));
			}
		}

		return values;
	}

	bulkGet(keys: string[]): unknown[] {
		return keys
			.map(x => {
				const data = this.storage.get(x);
				return data ? this.options.decode(data) : null;
			})
			.filter(x => x !== null);
	}

	get(key: string): unknown {
		const data = this.storage.get(key);
		return data ? this.options.decode(data) : null;
	}

	bulkSet(keys: [string, unknown][]) {
		for (const [key, value] of keys) {
			this.storage.set(key, this.options.encode(value));
		}
	}

	set(key: string, data: unknown) {
		this.storage.set(key, this.options.encode(data));
	}

	bulkPatch(updateOnly: boolean, keys: [string, unknown][]) {
        for (const [key, value] of keys) {
            const oldData = this.get(key);
            if (updateOnly && !oldData) {
                continue;
            }
            this.storage.set(
                key,
                Array.isArray(value)
                    ? this.options.encode(value)
                    : this.options.encode({
                            ...(typeof oldData === 'object' && oldData !== null ? oldData : {}),
                            ...(typeof value === 'object' && value !== null ? value : {}),
                      }),
            );
        }
    }
    
    patch(updateOnly: boolean, key: string, data: unknown) {
        const oldData = this.get(key);
        if (updateOnly && !oldData) {
            return;
        }
        this.storage.set(
            key,
            Array.isArray(data)
                ? this.options.encode(data)
                : this.options.encode({
                        ...(typeof oldData === 'object' && oldData !== null ? oldData : {}),
                        ...(typeof data === 'object' && data !== null ? data : {}),
                  }),
        );
    }
    

	values(to: string): unknown[] {
		const array: unknown[] = [];
		const data = this.keys(to);

		for (const key of data) {
			const content = this.get(key);

			if (content) {
				array.push(content);
			}
		}

		return array;
	}

	keys(to: string): string[] {
		return this.getToRelationship(to).map(id => `${to}.${id}`);
	}

	count(to: string): number {
		return this.getToRelationship(to).length;
	}

	bulkRemove(keys: string[]) {
		for (const i of keys) {
			this.storage.delete(i);
		}
	}

	remove(key: string) {
		this.storage.delete(key);
	}

	flush(): void {
		this.storage.clear();
		this.relationships.clear();
	}

	contains(to: string, key: string): boolean {
		return this.getToRelationship(to).includes(key);
	}

	getToRelationship(to: string): string[] {
		return this.relationships.get(to) || [];
	}

	bulkAddToRelationShip(data: Record<string, string[]>) {
		for (const i in data) {
			this.addToRelationship(i, data[i]);
		}
	}

	addToRelationship(to: string, keys: string | string[]) {
		if (!this.relationships.has(to)) {
			this.relationships.set(to, []);
		}

		const data = this.getToRelationship(to);

		for (const key of Array.isArray(keys) ? keys : [keys]) {
			if (!data.includes(key)) {
				data.push(key);
			}
		}
	}

	removeToRelationship(to: string, keys: string | string[]) {
		const data = this.getToRelationship(to);
		if (data) {
			for (const key of Array.isArray(keys) ? keys : [keys]) {
				const idx = data.indexOf(key);
				if (idx !== -1) {
					data.splice(idx, 1);
				}
			}
		}
	}

	removeRelationship(to: string | string[]) {
		for (const i of Array.isArray(to) ? to : [to]) {
			this.relationships.delete(i);
		}
	}
}
