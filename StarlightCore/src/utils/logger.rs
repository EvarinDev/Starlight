use log::{debug, error, info, log_enabled, Level};

// ? Logger module for StarlightCore
pub struct Logger {
    level: Level,
}

impl Logger {
    fn new(level: Level) -> Logger {
        Logger { level }
    }
    pub fn init(level: Level) {
        let logger = Logger::new(level);
        log::set_max_level(logger.level.to_level_filter());
        debug!("Logger initialized with level: {:?}", logger.level);
    }
    pub fn log(&self, level: Level, message: &str) {
        if log_enabled!(level) {
            match level {
                Level::Error => error!("{}", message),
                Level::Warn => log::warn!("{}", message),
                Level::Info => info!("{}", message),
                Level::Debug => debug!("{}", message),
                Level::Trace => log::trace!("{}", message),
            }
        }
    }
    pub fn debug(message: &str) {
        log::debug!("{}", message);
    }
    pub fn info(message: &str) {
        log::info!("{}", message);
    }
    pub fn warn(message: &str) {
        log::warn!("{}", message);
    }
    pub fn error(message: &str) {
        log::error!("{}", message);
    }
    pub fn trace(message: &str) {
        log::trace!("{}", message);
    }
}
