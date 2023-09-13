use clap::{Parser, Subcommand};
use colored::*;
use std::fs::File;
use std::io::Read;
use tokio;

mod add;
use add::add_fn;
mod list;
use list::list_fn;
mod new;
use new::new_fn;
mod deploy;
use deploy::deploy_fn;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
#[command(propagate_version = true)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    Add,
    List,
    New { project_name: String },
    Deploy,
}

#[tokio::main]
async fn main() {
    // 打开 Cargo.toml 文件
    let mut file = match File::open("Cargo.toml") {
        Ok(file) => file,
        Err(e) => {
            eprintln!("无法打开 Cargo.toml 文件: {}", e);
            return;
        }
    };
    // 读取文件内容到字符串
    let mut toml_content = String::new();
    if let Err(e) = file.read_to_string(&mut toml_content) {
        eprintln!("无法读取文件内容: {}", e);
        return;
    }
    // 解析 Cargo.toml 文件
    let toml_table = match toml::de::from_str::<toml::Value>(&toml_content) {
        Ok(toml) => toml,
        Err(e) => {
            eprintln!("无法解析 Cargo.toml 文件: {}", e);
            return;
        }
    };
    // 提取版本信息
    let version = match toml_table["package"]["version"].as_str() {
        Some(version) => version,
        None => {
            eprintln!("找不到版本信息");
            return;
        }
    };
    // 提取 name
    let name = match toml_table["package"]["name"].as_str() {
        Some(name) => name,
        None => {
            eprintln!("找不到name");
            return;
        }
    };
    let result = format!("{} info v{}", name, version).yellow();
    println!("{}", result);

    // 主流程
    let cli = Cli::parse();
    match &cli.command {
        Commands::Add => {
            let _ = add_fn().await;
        }
        Commands::List => {
            let _ = list_fn().await;
        }
        Commands::New { project_name } => {
            let _ = new_fn(&project_name).await;
        }
        Commands::Deploy => {
            deploy_fn();
        }
    }
}
