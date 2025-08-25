//! 核心模块
//! 
//! 包含应用程序的核心类型、配置和错误处理

pub mod config;
pub mod error;
pub mod types;

// 重新导出常用类型
pub use config::{get_config, Config};
pub use error::{AppError, AppResult};
pub use types::*;
