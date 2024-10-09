import { ClusterManager, HeartbeatManager } from "discord-hybrid-sharding";
import config from "./config";
import "dotenv/config";

const manager = new ClusterManager(`${__dirname}/client/index.js`, {
	totalShards: "auto",
	shardsPerClusters: 5,
	totalClusters: "auto",
	mode: "worker",
	token: config.TOKEN,
});

manager.extend(
	new HeartbeatManager({
		interval: 2000, // Interval to send a heartbeat
		maxMissedHeartbeats: 5, // Maximum amount of missed Heartbeats until Cluster will get respawned
	}),
);
manager.on("clusterCreate", (cluster) => {
	cluster.on("spawn", () => console.info(`Cluster ${cluster.id} spawned`));
	cluster.on("death", () => console.error(`Cluster ${cluster.id} died`));
	cluster.on("ready", () => console.info(`Cluster ${cluster.id} ready`));
	cluster.on("disconnect", () => console.warn(`Cluster ${cluster.id} disconnected`));
	cluster.on("reconnecting", () => console.warn(`Cluster ${cluster.id} reconnecting`));
	cluster.on("exit", () => console.error(`Cluster ${cluster.id} exited`));
	cluster.on("message", (message) => console.info(`Cluster ${cluster.id} message: ${JSON.stringify(message)}`));
	cluster.on("error", (error) => console.error(`Cluster ${cluster.id} error: ${error}`));
	cluster.on("warn", (warn) => console.warn(`Cluster ${cluster.id} warn: ${warn}`));
	process.on("SIGINT", () => {
		console.warn(`Cluster ${cluster.id} received SIGINT`);
		cluster.kill({
			force: true,
		});
	});
});
manager.on("debug", (debug) => console.debug(debug));
manager.spawn({ timeout: -1 })
	.then(() => console.info("All clusters spawned"))
	.catch((error) => console.error("Error spawning clusters:", error));