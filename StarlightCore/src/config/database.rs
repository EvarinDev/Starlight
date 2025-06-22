use std::time::Duration;

use log::LevelFilter;
use sea_orm::{ConnectOptions, Database, DatabaseConnection, DbErr};

use super::env::EnvConfig;

pub struct DatabaseConfig {
    // ! The URL for the database connection `postgres://user:password@host:port/<db>`
    pub database_url: String,
}

impl Default for DatabaseConfig {
    fn default() -> Self {
        DatabaseConfig::new()
    }
}

impl DatabaseConfig {
    pub fn new() -> DatabaseConfig {
        let env_config = EnvConfig::load();
        DatabaseConfig {
            database_url: env_config.database_url().to_string(),
        }
    }

    pub fn database_url(&self) -> &str {
        &self.database_url
    }

    #[tokio::main]
    pub async fn connect(&self) -> Result<DatabaseConnection, DbErr> {
        let mut opt = ConnectOptions::new(&self.database_url.clone());
        opt.max_connections(100)
            .min_connections(5)
            .connect_timeout(Duration::from_secs(8))
            .acquire_timeout(Duration::from_secs(8))
            .idle_timeout(Duration::from_secs(8))
            .max_lifetime(Duration::from_secs(8))
            .sqlx_logging(true)
            .sqlx_logging_level(LevelFilter::Info)
            .set_schema_search_path("my_schema"); // Setting default PostgreSQL schema

        let db = Database::connect(opt).await;
        match db {
            Ok(pool) => Ok(pool),
            Err(e) => {
                log::error!("Failed to connect to the database: {}", e);
                Err(e)
            }
        }
    }
}
