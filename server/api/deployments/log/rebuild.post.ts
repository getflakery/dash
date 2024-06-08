import { deploymentLogs } from "~/server/database/schema";
import { v4 as uuidv4 } from 'uuid';



export default eventHandler(async (event) => {
    // log body
    let body = await readRawBody(event);
    // [{"deployment_id":"6eee8b74-912c-41ac-ab67-e656d825eea4","host":"ip-10-0-4-89.us-west-2.compute.internal","message":"restarting systemd...","source_type":"stdin","timestamp":"2024-06-07T20:20:58.028655397Z"},{"deployment_id":"6eee8b74-912c-41ac-ab67-e656d825eea4","host":"ip-10-0-4-89.us-west-2.compute.internal","message":"reloading user units for root...","source_type":"stdin","timestamp":"2024-06-07T20:20:58.947289389Z"}]
    let logsBody: any[] = JSON.parse(body ?? '[]');

    let entries: {
        [key: string]: {
            date: number;
            exec: string;
            host: string;
        }[];
    } = logsBody.reduce((acc: any, log: any) => {
        if (acc[log.deployment_id] === undefined) {
            acc[log.deployment_id] = [];
        }
        acc[log.deployment_id].push({
            date: new Date(log.timestamp),
            exec: log.message,
            host: log.host,
        });
        return acc;
    }, {});

    const db = useDB();
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