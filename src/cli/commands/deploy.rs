use crate::core::{AppError, AppResult, EnvironmentConfig};
use crate::utils::UserInterface;
use colored::Colorize;
use ssh2::Session;
use std::fs::{self, File};
use std::io;
use std::net::TcpStream;
use std::path::Path;

/// 创建远程目录
fn create_remote_directory(sftp: &ssh2::Sftp, remote_dir: &Path) -> AppResult<()> {
    if sftp.stat(remote_dir).is_err() {
        sftp.mkdir(remote_dir, 0o755)?;
        println!("创建远程目录: {}", remote_dir.display());
    }
    Ok(())
}

/// 上传文件
fn upload_file(
    sftp: &ssh2::Sftp,
    local_file_path: &Path,
    remote_file_path: &Path,
) -> AppResult<()> {
    let mut remote_file = sftp.create(remote_file_path)?;
    let mut local_file = File::open(local_file_path)?;
    io::copy(&mut local_file, &mut remote_file)?;
    println!("上传文件: {}", remote_file_path.display());
    Ok(())
}

/// 上传目录
fn upload_directory(sftp: &ssh2::Sftp, local_dir: &Path, remote_dir: &Path) -> AppResult<()> {
    create_remote_directory(sftp, remote_dir)?;

    for entry in fs::read_dir(local_dir)? {
        let entry = entry?;
        let local_file_path = entry.path();
        let file_name = local_file_path
            .file_name()
            .ok_or_else(|| AppError::Custom("无法获取文件名".to_string()))?;
        let remote_file_path = remote_dir.join(file_name);

        if local_file_path.is_file() {
            upload_file(sftp, &local_file_path, &remote_file_path)?;
        } else if local_file_path.is_dir() {
            upload_directory(sftp, &local_file_path, &remote_file_path)?;
        }
    }

    Ok(())
}

/// 读取部署配置文件
fn read_deploy_config() -> AppResult<Vec<EnvironmentConfig>> {
    let config_file = File::open("deploy.config.json")?;
    let config: Vec<EnvironmentConfig> = serde_json::from_reader(config_file)?;
    Ok(config)
}

/// 执行部署
fn perform_deployment(config: &EnvironmentConfig) -> AppResult<()> {
    println!("{}", "开始部署...".green());

    let tcp = TcpStream::connect(&config.server_address)?;
    let mut session = Session::new()?;
    session.set_tcp_stream(tcp);
    session.handshake()?;

    session.userauth_password(&config.username, &config.password)?;

    if !session.authenticated() {
        return Err(AppError::Custom("SSH 认证失败".to_string()));
    }

    let sftp = session.sftp()?;
    let local_dir = Path::new(&config.local_dir);
    let remote_dir = Path::new(&config.remote_dir);

    upload_directory(&sftp, local_dir, remote_dir)?;

    Ok(())
}

/// 部署命令
pub async fn deploy_command() -> AppResult<()> {
    // 1. 读取部署配置
    let environments = read_deploy_config().map_err(|e| {
        AppError::Custom(format!(
            "读取配置失败，请检查当前目录的 deploy.config.json 文件: {e}"
        ))
    })?;

    // 2. 选择部署环境
    let selected_environment = UserInterface::select_environment(&environments)?;

    // 3. 执行部署
    perform_deployment(selected_environment)?;

    println!("{}", "部署成功！".green());
    Ok(())
}
