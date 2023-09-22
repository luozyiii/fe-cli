use colored::*;
use dialoguer::{theme::ColorfulTheme, Select};
use serde::{Deserialize, Serialize};
use serde_json;
use ssh2::Session;
use std::fs::{self, File};
use std::io::{self, Error as IoError, ErrorKind};
use std::net::TcpStream;
use std::path::Path;

// 创建远程目录
fn create_remote_directory(
    sftp: &ssh2::Sftp,
    remote_dir: &Path,
) -> Result<(), Box<dyn std::error::Error>> {
    if sftp.stat(remote_dir).is_err() {
        // If it does not exist, create the remote directory
        match sftp.mkdir(remote_dir, 0o755) {
            Ok(_) => {
                println!("创建远程目录: {:?}", remote_dir);
                Ok(())
            }
            Err(err) => {
                eprintln!("创建远程目录失败: {}", err);
                Err(Box::new(err))
            }
        }
    } else {
        // 目录已存在，直接返回
        Ok(())
    }
}

// 上传文件
fn upload_file(
    sftp: &ssh2::Sftp,
    local_file_path: &Path,
    remote_file_path: &Path,
) -> Result<(), Box<dyn std::error::Error>> {
    let mut remote_file = sftp.create(remote_file_path)?;
    let mut local_file = File::open(local_file_path)?;
    io::copy(&mut local_file, &mut remote_file)?;
    println!("上传文件: {:?}", remote_file_path);
    Ok(())
}

// 上传目录
fn upload_directory(
    sftp: &ssh2::Sftp,
    local_dir: &Path,
    remote_dir: &Path,
) -> Result<(), Box<dyn std::error::Error>> {
    create_remote_directory(sftp, remote_dir)?;

    for entry in fs::read_dir(local_dir)? {
        let entry = entry?;
        let local_file_path = entry.path();
        let remote_file_path = remote_dir.join(local_file_path.file_name().ok_or(IoError::new(
            ErrorKind::Other,
            "Failed to get file name for a local file.",
        ))?);

        if local_file_path.is_file() {
            upload_file(sftp, &local_file_path, &remote_file_path)?;
        } else if local_file_path.is_dir() {
            upload_directory(sftp, &local_file_path, &remote_file_path)?;
        }
    }

    Ok(())
}

// Create a struct to represent the environment configuration
#[derive(Debug, Deserialize, Serialize)]
struct EnvironmentConfig {
    name: String,
    server_address: String,
    username: String,
    password: String,
    local_dir: String,
    remote_dir: String,
}

// 读取 "deploy.config.json" 文件
fn read_config_from_file() -> Result<Vec<EnvironmentConfig>, Box<dyn std::error::Error>> {
    let config_file = File::open("deploy.config.json")?;
    let config: Vec<EnvironmentConfig> = serde_json::from_reader(config_file)?;
    Ok(config)
}

// 部署主流程
fn perform_deployment(config: &EnvironmentConfig) -> Result<(), Box<dyn std::error::Error>> {
    println!("{}", "开始部署...".green());

    let tcp = TcpStream::connect(&config.server_address)?;
    let mut sess = Session::new()?;
    sess.set_tcp_stream(tcp);
    sess.handshake()?;

    sess.userauth_password(&config.username, &config.password)?;
    assert!(sess.authenticated());

    let sftp = sess.sftp()?;
    let local_dir = Path::new(&config.local_dir);
    let remote_dir = Path::new(&config.remote_dir);

    upload_directory(&sftp, local_dir, remote_dir)?;

    Ok(())
}

// 选择部署环境
fn select_environment(config: &[EnvironmentConfig]) -> Option<&EnvironmentConfig> {
    let environment_names: Vec<&str> = config.iter().map(|env| env.name.as_str()).collect();
    let selection = Select::with_theme(&ColorfulTheme::default())
        .with_prompt("请选择部署环境")
        .default(0)
        .items(&environment_names)
        .interact()
        .ok()?;
    config.get(selection)
}

pub fn deploy_fn() {
    let config = match read_config_from_file() {
        Ok(config) => config,
        Err(err) => {
            eprintln!(
                "读取配置失败, 请检查当前目录的 deploy.config.json, 错误信息: {}",
                err
            );
            return;
        }
    };

    let selected_environment = match select_environment(&config) {
        Some(env) => env,
        None => {
            println!("{}", "deploy.config.json 没有配置, 请先配置.".red());
            return;
        }
    };

    match perform_deployment(selected_environment) {
        Ok(_) => println!("{}", "部署成功！".green()),
        Err(err) => eprintln!("{}", format!("部署失败: {}", err.to_string()).red()),
    }
}
