use tokio; 
use clap::{App, Arg, SubCommand};
use colored::*;
use std::fs::File;
use std::io::Read;

mod add;
use add::add_fn;
mod list;
use list::list_fn;
mod new;
use new::new_fn;

#[tokio::main]
async fn main() {
    let matches = App::new("fe-cli")
        .version("1.0.0")
        .author("leslie")
        .about("简单优雅的前端脚手架: 提高前端的研发效能")
        .subcommand(
            SubCommand::with_name("add")
                .about("添加模版")    
        )
        .subcommand(SubCommand::with_name("list").about("所有模版"))
        .subcommand(
            SubCommand::with_name("new")
                .about("新建项目")
                .arg(
                    Arg::with_name("project_name")
                        .help("项目名称")
                        .required(true)
                        .index(1),
                ),
        )
        .get_matches();
    
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

    let result = format!("{} info v{}", name,version).yellow();
    println!("{}", result);

    // 主流程开始
    if matches.subcommand_matches("add").is_some() {
        let _ = add_fn().await;
    }

    if matches.subcommand_matches("list").is_some() {
        let _ = list_fn().await;
    }

    if let Some(matches) =  matches.subcommand_matches("new") {
        let project_name = matches.value_of("project_name").unwrap();
        let _ = new_fn(&project_name).await;
    }
}
