/*
 * ! Runtime configuration module.
 * This module provides functionality to parse configuration from environment
 * variables, specifically those prefixed with `STARLIGHT_`. It defines a
 * base configuration model for the bot, which includes database and logging
 * configurations. The configuration is expected to derive from
 * [`serde::Deserialize`], allowing it to be easily parsed from the environment.
 */

use serde::{Deserialize, de};

/*
    Parse configuration from environment variables.
    Variables are loaded from `.env` file then parsed into the corresponding
    type. See the [module documentation](self) for more information.
    The environment variables must be prefixed with `STARLIGHT_` and the
    configuration model must derive [`serde::Deserialize`].
    The following environment variables are expected:
    - `STARLIGHT_TOKEN`: Discord bot token.
    - `STARLIGHT_DATABASE_URI`: PostgreSQL connection URI.
    - `STARLIGHT_DATABASE_NAME`: PostgreSQL database name.
    - `STARLIGHT_REDIS_URI`: Redis connection URI.
    - `STARLIGHT_LOG_TYPE`: Type of logger to use (terminal, file, none).
    - `STARLIGHT_LOG_LEVEL`: Max level of emitted logs (debug, info, warn, error).
    - `STARLIGHT_LOG_FOLDER`: Folder used to store logs when using file logger.
    # Example

    ```env
    STARLIGHT_TOKEN=your_token_here
    STARLIGHT_DATABASE_URI=postgres://localhost:5432
    STARLIGHT_DATABASE_NAME=starlight
    STARLIGHT_REDIS_URI=redis://localhost:6379
    STARLIGHT_LOG_TYPE=file
    STARLIGHT_LOG_LEVEL=info
    STARLIGHT_LOG_FOLDER=log
    ```
*/
pub fn parse_config<T>() -> Result<T, envy::Error>
where
    T: de::DeserializeOwned,
{
    dotenv::dotenv().ok();
    envy::prefixed("STARLIGHT_").from_env()
}

/// Base bot configuration model.
#[derive(Debug, Deserialize, Clone)]
pub struct BotConfig {
    /// Discord bot token.
    pub token: String,
    /// Databases configuration.
    #[serde(flatten, default)]
    pub database: shared::DatabaseConfig,
    /// Logging configuration.
    #[serde(flatten, default)]
    pub log: shared::LogConfig,
}

// Models shared by the base models.
pub mod shared {
    use serde::{Deserialize, de};
    use tracing::Level;
    use tracing_appender::non_blocking::WorkerGuard;

    /*
        This model is used to parse database configuration.
        It contains the connection URIs for Redis and PostgreSQL, as well as the
        database name for PostgreSQL.
    */
    #[derive(Debug, Deserialize, Clone)]
    #[serde(default)]
    pub struct DatabaseConfig {
        /*
            The format of the connection string is described [here].
            Defaults to `redis://localhost:6379`.
            [here]: https://redis.io/docs/latest/clients/connection-strings/
        */
        pub redis_uri: String,
        /*
            The format of the connection string is described [here].
            Defaults to `postgres://localhost:5432`.
            [here]: https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING
        */
        pub database_uri: String,
        /// Database name for PostgreSQL. defaults to `starlight`.
        pub database_name: String,
    }

    impl Default for DatabaseConfig {
        fn default() -> Self {
            Self {
                redis_uri: "redis://localhost:6379".to_owned(),
                database_uri: "postgres://localhost:5432".to_owned(),
                database_name: "starlight".to_owned(),
            }
        }
    }

    /*
        This model is used to parse logging configuration.
        It contains the type of logger to use, the max level of emitted logs,
        and the folder used to store logs when using file logger.
    */
    #[derive(Debug, Deserialize, Clone)]
    #[serde(default)]
    pub struct LogConfig {
        /// Logger used to emit logs.
        pub log_type: LogKind,
        /// Max level of emitted logs.
        #[serde(deserialize_with = "deserialize_level")]
        pub log_level: Level,
        /// Folder used to store logs with [`LogKind::File`].
        pub log_folder: String,
    }

    impl LogConfig {
        /*
            Initialize the logger based on the configured log type.
            If the log type is [`LogKind::None`], no logger is initialized.
            If the log type is [`LogKind::Terminal`], logs are emitted to the
            terminal using [`tracing_subscriber::fmt`].
            If the log type is [`LogKind::File`], logs are written to a file
            in the configured folder using [`tracing_appender`].
            The returned [`WorkerGuard`] must be dropped when the main process
            exits to ensure all logs are written in the file.
        */
        pub fn init(&self, name: impl AsRef<str>) -> Option<WorkerGuard> {
            match self.log_type {
                LogKind::Terminal => self.init_terminal(),
                LogKind::File => self.init_file(name.as_ref()),
                LogKind::None => None,
            }
        }

        /// Init logger with [`LogKind::Terminal`].
        fn init_terminal(&self) -> Option<WorkerGuard> {
            tracing_subscriber::fmt()
                .compact()
                .with_max_level(self.log_level)
                .init();

            None
        }

        /*
            Init logger with [`LogKind::File`].
            This will create a new file appender in the configured folder
            and write logs to it. The file name is given by `name`.
            The returned [`WorkerGuard`] must be dropped when the main process
            exits to ensure all logs are written in the file.
        */
        fn init_file(&self, name: &str) -> Option<WorkerGuard> {
            let appender = tracing_appender::rolling::hourly(&self.log_folder, name);
            let (writer, guard) = tracing_appender::non_blocking(appender);
            tracing_subscriber::fmt()
                .compact()
                .with_max_level(self.log_level)
                .with_writer(writer)
                .with_ansi(false)
                .init();

            Some(guard)
        }
    }

    impl Default for LogConfig {
        fn default() -> Self {
            Self {
                log_type: LogKind::Terminal,
                log_level: Level::INFO,
                log_folder: "log".into(),
            }
        }
    }

    /// Type of logger used to emit logs.
    #[derive(Debug, Deserialize, Copy, Clone, PartialEq, Eq)]
    #[serde(rename_all = "snake_case")]
    pub enum LogKind {
        /*
           ! Terminal output.
           This uses [`tracing_subscriber::fmt`] to emit logs
           to the terminal. The logs are formatted in a compact
           way and colored if the terminal supports it.
        */
        Terminal,
        /*
           ! File output.
           This uses [`tracing_appender`] to write logs to a file
           in the configured folder. The file name is given by
           the `name` parameter of [`LogConfig::init`].
           The logs are formatted in a compact way and written
           in a rolling fashion, meaning that a new file is created
           every hour.
        */
        File,
        /*
           ! No output.
           This means that no logger is initialized and no logs
           are emitted.
        */
        None,
    }

    fn deserialize_level<'de, D>(deserializer: D) -> Result<Level, D::Error>
    where
        D: de::Deserializer<'de>,
    {
        String::deserialize(deserializer)?
            .parse()
            .map_err(de::Error::custom)
    }
}
