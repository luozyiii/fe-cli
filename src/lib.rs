//! `FeMaker` - 前端脚手架工具
//!
//! 一个使用 Rust 开发的现代化前端脚手架工具，专为提升前端开发效率而设计。

// 核心模块
pub mod core;

// CLI 模块
pub mod cli;

// 工具模块
pub mod utils;

// 重新导出常用类型和函数
pub use core::{AppError, AppResult, Config, TemplateType, Template, EnvironmentConfig};
pub use cli::{add_command, deploy_command, list_command, new_command};
pub use utils::{HttpClient, UserInterface, fetch_templates, FileSystemUtils};
