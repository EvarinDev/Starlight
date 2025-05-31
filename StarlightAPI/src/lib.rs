/*!
   StarlightAPI
   StarlightAPI is a Rust library designed to provide a robust and efficient API for interacting with the Starlight platform.
   It includes modules for configuration management, database interactions, and serialization helpers.
*/

pub mod config;
pub mod database;
pub mod serde_helpers;

// Re-export commonly used types
pub use config::{BotConfig, parse_config};
pub use database::DatabaseConnection;
