//! Configuration module for Starlight API

pub mod config;

// Re-export the main types
pub use config::{parse_config, BotConfig, shared};
