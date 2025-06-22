use std::sync::Arc;

use twilight_gateway::{Event, Intents, Shard, ShardId};
use vesper::prelude::Framework;
use vesper::twilight_exports::{Client, Id};
use StarlightCore::{commands, ClusterConfig, ClusterManager, EnvConfig, Logger};

// Connect to Discord Gateway
async fn connect_gateway(token: &str) -> Result<Shard, Box<dyn std::error::Error + Send + Sync>> {
    Logger::info("🌐 Connecting to Discord Gateway...");

    // Define bot intents (what events the bot wants to receive)
    let intents = Intents::GUILDS
        | Intents::GUILD_MESSAGES
        | Intents::MESSAGE_CONTENT
        | Intents::GUILD_MEMBERS;

    // Create a shard (Gateway connection)
    let shard = Shard::new(ShardId::ONE, token.to_string(), intents);
    Logger::info("✅ Gateway shard created successfully!");
    Ok(shard)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Initialize simple logger
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Info)
        .init();
    // Load environment configuration
    let env_config = EnvConfig::load();
    let log_level = env_config
        .log_level()
        .parse()
        .unwrap_or(log::LevelFilter::Info);
    let application_id = env_config.discord_client_id().parse::<u64>()?;
    let http_client = Arc::new(Client::new(env_config.discord_token().to_string()));
    let mut shard = match connect_gateway(env_config.discord_token()).await {
        Ok(shard) => shard,
        Err(e) => {
            Logger::error("Failed to connect to Discord Gateway");
            return Err(e);
        }
    };

    let framework = Framework::builder(http_client, Id::new(application_id), ())
        .command(commands::info::ping::ping)
        .build();
    Logger::init(log_level.to_level().unwrap_or(log::Level::Info));
    Logger::info("StarlightCore Starting...");

    Logger::info(&format!("Environment: {}", env_config.env()));
    Logger::info(&format!("Log Level: {}", env_config.log_level()));
    Logger::info("Configuration loaded successfully!");
    Logger::info("🎉 Bot is now fully connected to Discord!");
    // Create cluster configuration
    let cluster_config = ClusterConfig::new(Some(1200), Some(5)); // 1200 guilds per shard, 5 shards per cluster
    // Create cluster manager
    let cluster_manager = ClusterManager::new(cluster_config);
    // Initialize and start cluster system
    match cluster_manager.initialize_clusters().await {
        Ok(_) => {
            Logger::info("Cluster system initialized successfully!");
            let stats = cluster_manager.get_cluster_stats().await;
            stats.display();
            if let Err(e) = cluster_manager.start_all_clusters().await {
                Logger::error(&format!("Failed to start clusters: {}", e));
                return Err(e);
            }

            Logger::info("All clusters started successfully!");
            Logger::info("Bot is now running. Press Ctrl+C to stop.");

            // Handle Gateway events in a separate task
            let gateway_handle = tokio::spawn(async move {
                loop {
                    match shard.next_event().await {
                        Ok(event) => match event {
                            Event::Ready(_) => {
                                if let Err(e) = framework.register_global_commands().await {
                                    Logger::error(&format!("Failed to register commands: {}", e));
                                }
                            }
                            Event::InteractionCreate(interaction) => {
                                Logger::info(&format!("Received interaction: {:?}", interaction));
                                framework.process(interaction.0).await;
                            }
                            _ => {
                                Logger::debug(&format!(
                                    "📨 Received Gateway event: {:?}",
                                    event.kind()
                                ));
                            }
                        },
                        Err(e) => {
                            Logger::error(&format!("❌ Gateway error: {}", e));
                            break;
                        }
                    }
                }
            });
            tokio::signal::ctrl_c().await?;
            Logger::info("Received shutdown signal...");
            gateway_handle.abort();
            cluster_manager.stop_all_clusters().await?;
            Logger::info("All clusters stopped. Goodbye!");
        }
        Err(e) => {
            Logger::error(&format!("Failed to initialize cluster system: {}", e));
            return Err(e);
        }
    }

    Ok(())
}
