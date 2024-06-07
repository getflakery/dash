import { deploymentLogs } from "~/server/database/schema";
import { useValidatedParams, z, } from 'h3-zod'
import { v4 as uuidv4 } from 'uuid';


class DefaultDict<K, V> {
    private map: Map<K, V>;
    private defaultFactory: () => V;

    constructor(defaultFactory: () => V) {
        this.map = new Map<K, V>();
        this.defaultFactory = defaultFactory;
    }

    get(key: K): V {
        if (!this.map.has(key)) {
            this.map.set(key, this.defaultFactory());
        }
        return this.map.get(key) as V;
    }

    set(key: K, value: V): void {
        this.map.set(key, value);
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

    delete(key: K): boolean {
        return this.map.delete(key);
    }

    keys(): IterableIterator<K> {
        return this.map.keys();
    }

    values(): IterableIterator<V> {
        return this.map.values();
    }

    entries(): IterableIterator<[K, V]> {
        return this.map.entries();
    }

    clear(): void {
        this.map.clear();
    }
}

export default eventHandler(async (event) => {
    // log body
    let body = await readRawBody(event);
    // [{"deployment_id":"6eee8b74-912c-41ac-ab67-e656d825eea4","host":"ip-10-0-4-89.us-west-2.compute.internal","message":"restarting systemd...","source_type":"stdin","timestamp":"2024-06-07T20:20:58.028655397Z"},{"deployment_id":"6eee8b74-912c-41ac-ab67-e656d825eea4","host":"ip-10-0-4-89.us-west-2.compute.internal","message":"reloading user units for root...","source_type":"stdin","timestamp":"2024-06-07T20:20:58.947289389Z"}]
    let logsBody = JSON.parse(body ?? '[]');

    const defaultDict = new DefaultDict<
        string, {
            date: Date,
            exec: string,
        }[]
    >(() => []);

    let entries: typeof defaultDict = logsBody.reduce((acc: any, log: any) => {
        acc[log.deployment_id].push({
            date: new Date(log.timestamp),
            exec: log.message,
        });
        return acc;
    }, defaultDict);

    const db = useDB()
    const logs = Object.entries(entries).map(([deploymentID, logs]) => {
        return {
            id: uuidv4(),
            deploymentID: deploymentID,
            logs: logs,
        };
    });

    return await Promise.all(logs.map(async log => {
        return await db.insert(deploymentLogs).values(log).returning().get();
    }));
});