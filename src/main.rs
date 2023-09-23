use clap::{Parser, Subcommand};
use colored::*;
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
    let version = env!("CARGO_PKG_VERSION");
    let name = env!("CARGO_PKG_NAME");
    let info = format!("{} v{}", name, version);
    println!("{}", info.yellow());

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
