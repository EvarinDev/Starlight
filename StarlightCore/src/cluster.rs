use log::{error, info, warn};
use std::collections::HashMap;
use std::sync::Arc;
use std::thread::{self, JoinHandle};
use tokio::sync::{RwLock, mpsc};
use twilight_gateway::{Config, Intents};
use twilight_http::Client as HttpClient;

use crate::config::EnvConfig;

/// Default maximum number of guilds per shard
const DEFAULT_SHARD_LIMIT: u32 = 1200;

/// Default number of shards per cluster
const DEFAULT_SHARD_PER_CLUSTER: u32 = 5;

/// Cluster configuration structure
#[derive(Debug, Clone)]
pub struct ClusterConfig {
    /// Maximum guilds per shard
    pub shard_limit: u32,
    /// Number of shards per cluster (each cluster runs in its own thread)
    pub shard_per_cluster: u32,
    /// Discord bot token
    pub token: String,
    /// Bot intents
    pub intents: Intents,
}

impl Default for ClusterConfig {
    fn default() -> Self {
        let env_config = EnvConfig::load();
        Self {
            shard_limit: DEFAULT_SHARD_LIMIT,
            shard_per_cluster: DEFAULT_SHARD_PER_CLUSTER,
            token: env_config.discord_token().to_string(),
            intents: Intents::GUILDS | Intents::GUILD_MESSAGES | Intents::MESSAGE_CONTENT,
        }
    }
}

impl ClusterConfig {
    /// Create a new cluster configuration
    pub fn new(shard_limit: Option<u32>, shard_per_cluster: Option<u32>) -> Self {
        let env_config = EnvConfig::load();
        Self {
            shard_limit: shard_limit.unwrap_or(DEFAULT_SHARD_LIMIT),
            shard_per_cluster: shard_per_cluster.unwrap_or(DEFAULT_SHARD_PER_CLUSTER),
            token: env_config.discord_token().to_string(),
            intents: Intents::GUILDS | Intents::GUILD_MESSAGES | Intents::MESSAGE_CONTENT,
        }
    }

    /// Set custom intents
    pub fn with_intents(mut self, intents: Intents) -> Self {
        self.intents = intents;
        self
    }
}

/// Commands that can be sent to a cluster thread
#[derive(Debug)]
pub enum ClusterCommand {
    Start,
    Stop,
    Restart,
    GetStatus,
}

/// Status of a cluster
#[derive(Debug, Clone)]
pub enum ClusterStatus {
    Stopped,
    Starting,
    Running,
    Stopping,
    Error(String),
}

/// A cluster represents a group of shards running in a single thread
#[derive(Debug)]
pub struct Cluster {
    /// Cluster ID
    pub id: u32,
    /// Shard range (start, end)
    pub shard_range: (u32, u32),
    /// Total shards in the bot
    pub total_shards: u32,
    /// Thread handle for this cluster
    thread_handle: Option<JoinHandle<()>>,
    /// Command sender to communicate with the cluster thread
    command_sender: Option<mpsc::UnboundedSender<ClusterCommand>>,
    /// Current status of the cluster
    status: Arc<RwLock<ClusterStatus>>,
    /// Configuration for this cluster
    config: ClusterConfig,
}

impl Cluster {
    /// Create a new cluster
    pub fn new(
        cluster_id: u32,
        shard_range: (u32, u32),
        total_shards: u32,
        config: ClusterConfig,
    ) -> Self {
        Self {
            id: cluster_id,
            shard_range,
            total_shards,
            thread_handle: None,
            command_sender: None,
            status: Arc::new(RwLock::new(ClusterStatus::Stopped)),
            config,
        }
    }

    /// Start the cluster in its own thread
    pub async fn start(&mut self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        if self.thread_handle.is_some() {
            warn!("Cluster {} is already running", self.id);
            return Ok(());
        }

        info!(
            "Starting cluster {} with shards {:?}",
            self.id, self.shard_range
        );
        // Update status to starting
        {
            let mut status = self.status.write().await;
            *status = ClusterStatus::Starting;
        }

        let (cmd_tx, mut cmd_rx) = mpsc::unbounded_channel::<ClusterCommand>();
        self.command_sender = Some(cmd_tx);

        let cluster_id = self.id;
        let shard_range = self.shard_range;
        let _total_shards = self.total_shards;
        let config = self.config.clone();
        let status = Arc::clone(&self.status);

        // Spawn cluster thread
        let handle =
            thread::spawn(move || {
                // Create a new Tokio runtime for this thread
                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(async {
                info!("Cluster {} thread started", cluster_id);
                // Update status to running
                {
                    let mut status_guard = status.write().await;
                    *status_guard = ClusterStatus::Running;
                }

                // Create shards for this cluster using twilight v0.16 API
                let mut stream_handles = Vec::new();
                let (start_shard, end_shard) = shard_range;

                for shard_id in start_shard..=end_shard {
                    let _shard_config = Config::new(config.token.clone(), config.intents);
                    info!("Creating shard {} with config", shard_id);
                    // Create a simple shard placeholder for this implementation
                    // In a real implementation, you would create actual shards here
                    let shard_handle = tokio::spawn(async move {
                        info!("Shard {} is running in cluster {}", shard_id, cluster_id);
                        // Simulate shard work
                        loop {
                            tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
                            info!("Shard {} heartbeat", shard_id);
                        }
                    });
                    stream_handles.push(shard_handle);
                }

                info!("Cluster {} created {} shard handles", cluster_id, stream_handles.len());

                // Command processing loop
                loop {
                    tokio::select! {
                        // Handle commands
                        cmd = cmd_rx.recv() => {
                            match cmd {
                                Some(ClusterCommand::Stop) => {
                                    info!("Received stop command for cluster {}", cluster_id);
                                    break;
                                }
                                Some(ClusterCommand::Restart) => {
                                    info!("Received restart command for cluster {}", cluster_id);
                                    // TODO: Implement restart logic
                                }
                                Some(ClusterCommand::GetStatus) => {
                                    info!("Status request for cluster {}: Running", cluster_id);
                                }
                                Some(ClusterCommand::Start) => {
                                    info!("Cluster {} is already running", cluster_id);
                                }
                                None => {
                                    info!("Command channel closed for cluster {}", cluster_id);
                                    break;
                                }
                            }
                        }
                        // Handle shard completions (if any shard dies, we might want to restart it)
                        _ = futures::future::join_all(&mut stream_handles) => {
                            warn!("All shards in cluster {} have stopped", cluster_id);
                            break;
                        }
                    }
                }

                // Update status to stopped
                {
                    let mut status_guard = status.write().await;
                    *status_guard = ClusterStatus::Stopped;
                }

                info!("Cluster {} thread stopped", cluster_id);
            });
            });

        self.thread_handle = Some(handle);

        // Wait a bit to ensure the cluster starts properly
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        info!("Cluster {} started successfully", self.id);
        Ok(())
    }

    /// Stop the cluster
    pub async fn stop(&mut self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        info!("Stopping cluster {}", self.id);

        // Update status to stopping
        {
            let mut status = self.status.write().await;
            *status = ClusterStatus::Stopping;
        }

        // Send stop command
        if let Some(sender) = &self.command_sender {
            if let Err(e) = sender.send(ClusterCommand::Stop) {
                warn!("Failed to send stop command to cluster {}: {}", self.id, e);
            }
        }

        // Wait for thread to finish
        if let Some(handle) = self.thread_handle.take() {
            if let Err(e) = handle.join() {
                error!("Failed to join cluster {} thread: {:?}", self.id, e);
            }
        }

        self.command_sender = None;

        info!("Cluster {} stopped successfully", self.id);
        Ok(())
    }

    /// Get the current status of the cluster
    pub async fn get_status(&self) -> ClusterStatus {
        self.status.read().await.clone()
    }

    /// Send a command to the cluster
    pub async fn send_command(
        &self,
        command: ClusterCommand,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        if let Some(sender) = &self.command_sender {
            sender.send(command)?;
            Ok(())
        } else {
            Err("Cluster is not running".into())
        }
    }
}

/// Detailed information about a cluster
#[derive(Debug, Clone)]
pub struct ClusterInfo {
    pub id: u32,
    pub shard_range: (u32, u32),
    pub total_shards: u32,
    pub status: ClusterStatus,
    pub is_running: bool,
    pub config: ClusterConfig,
}

/// Cluster metrics for monitoring
#[derive(Debug, Clone)]
pub struct ClusterMetrics {
    pub cluster_id: u32,
    pub uptime_seconds: u64,
    pub message_count: u64,
    pub error_count: u64,
    pub last_heartbeat: std::time::SystemTime,
    pub memory_usage_mb: f64,
    pub cpu_usage_percent: f64,
}

/// Cluster manager for handling Discord bot sharding with 1 cluster = 1 thread
#[derive(Debug)]
pub struct ClusterManager {
    /// Cluster configuration
    config: ClusterConfig,
    /// HTTP client for Discord API
    http_client: HttpClient,
    /// Map of cluster ID to cluster instance
    clusters: Arc<RwLock<HashMap<u32, Cluster>>>,
    /// Total number of guilds
    total_guilds: Arc<RwLock<u32>>,
    /// Total number of shards
    total_shards: Arc<RwLock<u32>>,
    /// Number of clusters
    cluster_count: Arc<RwLock<u32>>,
}

impl ClusterManager {
    /// Create a new cluster manager
    pub fn new(config: ClusterConfig) -> Self {
        let http_client = HttpClient::new(config.token.clone());

        Self {
            config,
            http_client,
            clusters: Arc::new(RwLock::new(HashMap::new())),
            total_guilds: Arc::new(RwLock::new(0)),
            total_shards: Arc::new(RwLock::new(0)),
            cluster_count: Arc::new(RwLock::new(0)),
        }
    }

    /// Get the number of guilds the bot is in
    pub async fn get_guild_count(&self) -> Result<u32, Box<dyn std::error::Error + Send + Sync>> {
        info!("Fetching guild count from Discord API...");

        // Get current user (bot) information
        let current_user = self.http_client.current_user().await?;
        info!("Bot user: {}", current_user.model().await?.name);

        // Get guilds (this is paginated, but for simplicity we'll get first batch)
        let guilds = self.http_client.current_user_guilds().await?;
        let guild_models = guilds.models().await?;
        let guild_count = guild_models.len() as u32;

        info!("Bot is currently in {} guilds", guild_count);

        // Update stored guild count
        let mut total_guilds = self.total_guilds.write().await;
        *total_guilds = guild_count;

        Ok(guild_count)
    }

    /// Calculate the number of shards needed based on guild count
    pub async fn calculate_shard_count(
        &self,
    ) -> Result<u32, Box<dyn std::error::Error + Send + Sync>> {
        let guild_count = self.get_guild_count().await?;

        // Calculate shards needed: ceil(guild_count / shard_limit)
        let shard_count = (guild_count + self.config.shard_limit - 1) / self.config.shard_limit;
        let shard_count = shard_count.max(1); // At least 1 shard

        info!(
            "Calculated {} shards needed for {} guilds (limit: {} guilds per shard)",
            shard_count, guild_count, self.config.shard_limit
        );

        // Update stored shard count
        let mut total_shards = self.total_shards.write().await;
        *total_shards = shard_count;

        Ok(shard_count)
    }

    /// Calculate the number of clusters needed (1 cluster per thread)
    pub async fn calculate_cluster_count(
        &self,
    ) -> Result<u32, Box<dyn std::error::Error + Send + Sync>> {
        let shard_count = self.calculate_shard_count().await?;

        // Calculate clusters needed: ceil(shard_count / shard_per_cluster)
        // Each cluster runs in its own thread
        let cluster_count =
            (shard_count + self.config.shard_per_cluster - 1) / self.config.shard_per_cluster;
        let cluster_count = cluster_count.max(1); // At least 1 cluster

        info!(
            "Calculated {} clusters needed for {} shards ({} shards per cluster, 1 thread per cluster)",
            cluster_count, shard_count, self.config.shard_per_cluster
        );

        // Update stored cluster count
        let mut stored_cluster_count = self.cluster_count.write().await;
        *stored_cluster_count = cluster_count;

        Ok(cluster_count)
    }

    /// Initialize all clusters
    pub async fn initialize_clusters(
        &self,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        info!("Initializing cluster system...");

        let cluster_count = self.calculate_cluster_count().await?;
        let total_shards = *self.total_shards.read().await;

        let mut clusters = self.clusters.write().await;

        for cluster_id in 0..cluster_count {
            let start_shard = cluster_id * self.config.shard_per_cluster;
            let end_shard =
                ((cluster_id + 1) * self.config.shard_per_cluster - 1).min(total_shards - 1);

            let cluster = Cluster::new(
                cluster_id,
                (start_shard, end_shard),
                total_shards,
                self.config.clone(),
            );

            clusters.insert(cluster_id, cluster);
            info!(
                "Cluster {} initialized (shards {}-{}) -> will run in thread {}",
                cluster_id, start_shard, end_shard, cluster_id
            );
        }

        info!(
            "All {} clusters initialized successfully (each cluster = 1 thread)",
            cluster_count
        );
        Ok(())
    }

    /// Start all clusters (each in its own thread)
    pub async fn start_all_clusters(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        info!("Starting all clusters (each cluster starts in its own thread)...");

        let mut clusters = self.clusters.write().await;

        for (cluster_id, cluster) in clusters.iter_mut() {
            info!(
                "Starting cluster {} in thread {}...",
                cluster_id, cluster_id
            );
            cluster.start().await?;
            info!(
                "Cluster {} started successfully in its own thread",
                cluster_id
            );
        }

        info!("All clusters started successfully (each running in separate thread)");
        Ok(())
    }

    /// Stop all clusters
    pub async fn stop_all_clusters(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        info!("Stopping all clusters...");

        let mut clusters = self.clusters.write().await;

        for (cluster_id, cluster) in clusters.iter_mut() {
            info!("Stopping cluster {} (thread {})...", cluster_id, cluster_id);
            cluster.stop().await?;
            info!("Cluster {} stopped", cluster_id);
        }

        info!("All clusters stopped");
        Ok(())
    }

    /// Get cluster statistics
    pub async fn get_cluster_stats(&self) -> ClusterStats {
        let clusters = self.clusters.read().await;
        let total_guilds = *self.total_guilds.read().await;
        let total_shards = *self.total_shards.read().await;
        let cluster_count = *self.cluster_count.read().await;

        // Get status of each cluster
        let mut cluster_statuses = HashMap::new();
        for (id, cluster) in clusters.iter() {
            let status = cluster.get_status().await;
            cluster_statuses.insert(*id, status);
        }

        ClusterStats {
            total_guilds,
            total_shards,
            cluster_count,
            active_clusters: clusters.len() as u32,
            shards_per_cluster: self.config.shard_per_cluster,
            guilds_per_shard_limit: self.config.shard_limit,
            cluster_statuses,
        }
    }

    /// Get a specific cluster's status
    pub async fn get_cluster_status(&self, cluster_id: u32) -> Option<ClusterStatus> {
        let clusters = self.clusters.read().await;
        if let Some(cluster) = clusters.get(&cluster_id) {
            Some(cluster.get_status().await)
        } else {
            None
        }
    }

    /// Send a command to a specific cluster
    pub async fn send_cluster_command(
        &self,
        cluster_id: u32,
        command: ClusterCommand,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let clusters = self.clusters.read().await;
        if let Some(cluster) = clusters.get(&cluster_id) {
            cluster.send_command(command).await
        } else {
            Err(format!("Cluster {} not found", cluster_id).into())
        }
    }

    /// Restart a specific cluster
    pub async fn restart_cluster(
        &self,
        cluster_id: u32,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        info!("Restarting cluster {}...", cluster_id);

        let mut clusters = self.clusters.write().await;
        if let Some(cluster) = clusters.get_mut(&cluster_id) {
            // Stop the cluster first
            cluster.stop().await?;

            // Wait a bit before restarting
            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

            // Start the cluster again
            cluster.start().await?;

            info!("Cluster {} restarted successfully", cluster_id);
            Ok(())
        } else {
            Err(format!("Cluster {} not found", cluster_id).into())
        }
    }

    /// Health check for all clusters
    pub async fn health_check(&self) -> HashMap<u32, bool> {
        let clusters = self.clusters.read().await;
        let mut health_status = HashMap::new();

        for (cluster_id, cluster) in clusters.iter() {
            let status = cluster.get_status().await;
            let is_healthy = matches!(status, ClusterStatus::Running);
            health_status.insert(*cluster_id, is_healthy);

            if !is_healthy {
                warn!("Cluster {} is unhealthy: {:?}", cluster_id, status);
            }
        }

        health_status
    }

    /// Get detailed cluster information
    pub async fn get_cluster_info(&self, cluster_id: u32) -> Option<ClusterInfo> {
        let clusters = self.clusters.read().await;
        if let Some(cluster) = clusters.get(&cluster_id) {
            let status = cluster.get_status().await;
            Some(ClusterInfo {
                id: cluster.id,
                shard_range: cluster.shard_range,
                total_shards: cluster.total_shards,
                status,
                is_running: cluster.thread_handle.is_some(),
                config: cluster.config.clone(),
            })
        } else {
            None
        }
    }

    /// Scale the cluster system by adding or removing clusters
    pub async fn scale_clusters(
        &self,
        target_cluster_count: u32,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let current_cluster_count = *self.cluster_count.read().await;

        if target_cluster_count == current_cluster_count {
            info!(
                "Cluster count is already at target: {}",
                target_cluster_count
            );
            return Ok(());
        }

        if target_cluster_count > current_cluster_count {
            // Scale up - add new clusters
            info!(
                "Scaling up from {} to {} clusters",
                current_cluster_count, target_cluster_count
            );
            self.add_clusters(target_cluster_count - current_cluster_count)
                .await?;
        } else {
            // Scale down - remove clusters
            info!(
                "Scaling down from {} to {} clusters",
                current_cluster_count, target_cluster_count
            );
            self.remove_clusters(current_cluster_count - target_cluster_count)
                .await?;
        }

        Ok(())
    }

    /// Add new clusters to the system
    async fn add_clusters(
        &self,
        count: u32,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut clusters = self.clusters.write().await;
        let current_cluster_count = clusters.len() as u32;
        let total_shards = *self.total_shards.read().await;

        for i in 0..count {
            let cluster_id = current_cluster_count + i;
            let start_shard = cluster_id * self.config.shard_per_cluster;
            let end_shard =
                ((cluster_id + 1) * self.config.shard_per_cluster - 1).min(total_shards - 1);

            if start_shard >= total_shards {
                warn!(
                    "Cannot add cluster {}: start_shard {} >= total_shards {}",
                    cluster_id, start_shard, total_shards
                );
                break;
            }

            let mut cluster = Cluster::new(
                cluster_id,
                (start_shard, end_shard),
                total_shards,
                self.config.clone(),
            );

            cluster.start().await?;
            clusters.insert(cluster_id, cluster);

            info!(
                "Added and started cluster {} (shards {}-{})",
                cluster_id, start_shard, end_shard
            );
        }

        // Update cluster count
        let mut stored_cluster_count = self.cluster_count.write().await;
        *stored_cluster_count = clusters.len() as u32;

        Ok(())
    }

    /// Remove clusters from the system
    async fn remove_clusters(
        &self,
        count: u32,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut clusters = self.clusters.write().await;
        let current_cluster_count = clusters.len() as u32;

        // Remove clusters starting from the highest ID
        for i in 0..count {
            let cluster_id = current_cluster_count - 1 - i;
            if let Some(mut cluster) = clusters.remove(&cluster_id) {
                cluster.stop().await?;
                info!("Removed cluster {}", cluster_id);
            }
        }

        // Update cluster count
        let mut stored_cluster_count = self.cluster_count.write().await;
        *stored_cluster_count = clusters.len() as u32;

        Ok(())
    }

    /// Monitor cluster performance and auto-restart unhealthy clusters
    pub async fn monitor_and_maintain(
        &self,
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        info!("Starting cluster monitoring and maintenance...");

        let health_status = self.health_check().await;
        let mut unhealthy_clusters = Vec::new();

        for (cluster_id, is_healthy) in health_status {
            if !is_healthy {
                unhealthy_clusters.push(cluster_id);
            }
        }

        if !unhealthy_clusters.is_empty() {
            warn!(
                "Found {} unhealthy clusters: {:?}",
                unhealthy_clusters.len(),
                unhealthy_clusters
            );

            for cluster_id in unhealthy_clusters {
                match self.restart_cluster(cluster_id).await {
                    Ok(_) => info!("Successfully restarted unhealthy cluster {}", cluster_id),
                    Err(e) => error!("Failed to restart cluster {}: {}", cluster_id, e),
                }
            }
        } else {
            info!("All clusters are healthy");
        }

        Ok(())
    }

    /// Auto-scale based on guild count changes
    pub async fn auto_scale(&self) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        info!("Performing auto-scale check...");

        let new_cluster_count = self.calculate_cluster_count().await?;
        let current_cluster_count = *self.cluster_count.read().await;

        if new_cluster_count != current_cluster_count {
            info!(
                "Auto-scaling: {} -> {} clusters",
                current_cluster_count, new_cluster_count
            );
            self.scale_clusters(new_cluster_count).await?;
        } else {
            info!(
                "No scaling needed. Current cluster count: {}",
                current_cluster_count
            );
        }

        Ok(())
    }
}

/// Statistics about the cluster system
#[derive(Debug, Clone)]
pub struct ClusterStats {
    pub total_guilds: u32,
    pub total_shards: u32,
    pub cluster_count: u32,
    pub active_clusters: u32,
    pub shards_per_cluster: u32,
    pub guilds_per_shard_limit: u32,
    pub cluster_statuses: HashMap<u32, ClusterStatus>,
}

impl ClusterStats {
    /// Display cluster statistics
    pub fn display(&self) {
        info!("=== Cluster Statistics (1 Cluster = 1 Thread) ===");
        info!("Total Guilds: {}", self.total_guilds);
        info!("Total Shards: {}", self.total_shards);
        info!("Total Clusters: {}", self.cluster_count);
        info!("Active Clusters: {}", self.active_clusters);
        info!("Shards per Cluster: {}", self.shards_per_cluster);
        info!("Guilds per Shard Limit: {}", self.guilds_per_shard_limit);
        info!("Cluster Threading: 1 cluster = 1 thread");

        for (cluster_id, status) in &self.cluster_statuses {
            info!(
                "Cluster {} (Thread {}): {:?}",
                cluster_id, cluster_id, status
            );
        }

        info!("====================================================");
    }

    /// Get cluster efficiency metrics
    pub fn get_efficiency_metrics(&self) -> ClusterEfficiencyMetrics {
        let running_clusters = self
            .cluster_statuses
            .values()
            .filter(|status| matches!(status, ClusterStatus::Running))
            .count() as u32;

        let total_shard_capacity = self.cluster_count * self.shards_per_cluster;
        let shard_utilization = if total_shard_capacity > 0 {
            (self.total_shards as f64 / total_shard_capacity as f64) * 100.0
        } else {
            0.0
        };

        let guild_per_shard_avg = if self.total_shards > 0 {
            self.total_guilds as f64 / self.total_shards as f64
        } else {
            0.0
        };

        ClusterEfficiencyMetrics {
            shard_utilization_percent: shard_utilization,
            average_guilds_per_shard: guild_per_shard_avg,
            cluster_availability_percent: if self.cluster_count > 0 {
                (running_clusters as f64 / self.cluster_count as f64) * 100.0
            } else {
                0.0
            },
            recommended_shard_count: (self.total_guilds + self.guilds_per_shard_limit - 1)
                / self.guilds_per_shard_limit,
            recommended_cluster_count: ((self.total_guilds + self.guilds_per_shard_limit - 1)
                / self.guilds_per_shard_limit
                + self.shards_per_cluster
                - 1)
                / self.shards_per_cluster,
        }
    }
}

/// Cluster efficiency and performance metrics
#[derive(Debug, Clone)]
pub struct ClusterEfficiencyMetrics {
    pub shard_utilization_percent: f64,
    pub average_guilds_per_shard: f64,
    pub cluster_availability_percent: f64,
    pub recommended_shard_count: u32,
    pub recommended_cluster_count: u32,
}

impl ClusterEfficiencyMetrics {
    /// Display efficiency metrics
    pub fn display(&self) {
        info!("=== Cluster Efficiency Metrics ===");
        info!("Shard Utilization: {:.2}%", self.shard_utilization_percent);
        info!(
            "Average Guilds per Shard: {:.2}",
            self.average_guilds_per_shard
        );
        info!(
            "Cluster Availability: {:.2}%",
            self.cluster_availability_percent
        );
        info!("Recommended Shard Count: {}", self.recommended_shard_count);
        info!(
            "Recommended Cluster Count: {}",
            self.recommended_cluster_count
        );

        // Provide recommendations
        if self.shard_utilization_percent < 50.0 {
            warn!("Low shard utilization detected. Consider reducing cluster count.");
        } else if self.shard_utilization_percent > 90.0 {
            warn!("High shard utilization detected. Consider adding more clusters.");
        }

        if self.cluster_availability_percent < 100.0 {
            warn!("Some clusters are not running. Check cluster health.");
        }

        info!("===================================");
    }
}

/// Performance monitoring for clusters
pub struct ClusterMonitor {
    start_time: std::time::SystemTime,
    metrics: Arc<RwLock<HashMap<u32, ClusterMetrics>>>,
}

impl ClusterMonitor {
    /// Create a new cluster monitor
    pub fn new() -> Self {
        Self {
            start_time: std::time::SystemTime::now(),
            metrics: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Update metrics for a specific cluster
    pub async fn update_cluster_metrics(
        &self,
        cluster_id: u32,
        message_count: u64,
        error_count: u64,
    ) {
        let mut metrics = self.metrics.write().await;
        let cluster_metrics = metrics.entry(cluster_id).or_insert_with(|| ClusterMetrics {
            cluster_id,
            uptime_seconds: 0,
            message_count: 0,
            error_count: 0,
            last_heartbeat: std::time::SystemTime::now(),
            memory_usage_mb: 0.0,
            cpu_usage_percent: 0.0,
        });

        cluster_metrics.message_count += message_count;
        cluster_metrics.error_count += error_count;
        cluster_metrics.last_heartbeat = std::time::SystemTime::now();
        cluster_metrics.uptime_seconds = cluster_metrics
            .last_heartbeat
            .duration_since(self.start_time)
            .unwrap_or_default()
            .as_secs();
    }

    /// Get metrics for all clusters
    pub async fn get_all_metrics(&self) -> HashMap<u32, ClusterMetrics> {
        self.metrics.read().await.clone()
    }

    /// Get metrics for a specific cluster
    pub async fn get_cluster_metrics(&self, cluster_id: u32) -> Option<ClusterMetrics> {
        self.metrics.read().await.get(&cluster_id).cloned()
    }

    /// Display all cluster metrics
    pub async fn display_metrics(&self) {
        let metrics = self.get_all_metrics().await;

        info!("=== Cluster Performance Metrics ===");
        for (cluster_id, metric) in metrics {
            info!(
                "Cluster {}: Uptime: {}s, Messages: {}, Errors: {}, Last Heartbeat: {:?}",
                cluster_id,
                metric.uptime_seconds,
                metric.message_count,
                metric.error_count,
                metric.last_heartbeat
            );
        }
        info!("==================================");
    }
}
