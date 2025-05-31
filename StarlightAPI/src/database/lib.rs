//! Database module for Starlight API
//!
//! This module provides database connection and management functionality.

use crate::config::shared::DatabaseConfig;
use sea_orm::{Database, DatabaseConnection as SeaOrmConnection, DbErr};

/// Database connection wrapper
pub struct DatabaseConnection {
    connection: SeaOrmConnection,
}

impl DatabaseConnection {
    /// Create a new database connection from configuration
    pub async fn new(config: &DatabaseConfig) -> Result<Self, DbErr> {
        let database_url = format!("{}/{}", config.database_uri, config.database_name);
        let connection = Database::connect(&database_url).await?;

        Ok(Self { connection })
    }

    /// Get the underlying SeaORM connection
    pub fn connection(&self) -> &SeaOrmConnection {
        &self.connection
    }
}
