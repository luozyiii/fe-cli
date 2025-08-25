use clap::{Parser, Subcommand};
use colored::Colorize;

// 使用 lib.rs 中的模块
use femaker::{add_command, deploy_command, list_command, new_command};

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
    let version = env!("CARGO_PKG_VERSION");
    let name = env!("CARGO_PKG_NAME");
    let info = format!("{name} v{version}");
    println!("{}", info.yellow());

    // 主流程
    let cli = Cli::parse();
    let result = match &cli.command {
        Commands::Add => add_command().await,
        Commands::List => list_command().await,
        Commands::New { project_name } => new_command(project_name).await,
        Commands::Deploy => deploy_command().await,
    };

    // 统一错误处理
    if let Err(e) = result {
        eprintln!("{}", format!("错误: {e}").red());
        std::process::exit(1);
    }
}
