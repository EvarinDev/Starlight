// Configuration module for StarlightCore

pub mod database;
pub mod env;

// Re-export for convenience
pub use database::DatabaseConfig;
pub use env::EnvConfig;
