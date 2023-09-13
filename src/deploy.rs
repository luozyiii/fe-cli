use ssh2::Session;
use std::fs::{self, File};
use std::io::{self, Error as IoError, ErrorKind};
use std::net::TcpStream;
use std::path::{Path};
use colored::*;
use serde::{Deserialize, Serialize};
use serde_json;

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


fn upload_directory(
    sftp: &ssh2::Sftp,
    local_dir: &Path,
    remote_dir: &Path,
) -> Result<(), Box<dyn std::error::Error>> {
    create_remote_directory(sftp, remote_dir)?;

    for entry in fs::read_dir(local_dir)? {
        let entry = entry?;
        let local_file_path = entry.path();
        let remote_file_path = remote_dir.join(local_file_path.file_name().ok_or(
            IoError::new(
                ErrorKind::Other,
                "Failed to get file name for a local file.",
            ),
        )?);

        if local_file_path.is_file() {
            upload_file(sftp, &local_file_path, &remote_file_path)?;
        } else if local_file_path.is_dir() {
            upload_directory(sftp, &local_file_path, &remote_file_path)?;
        }
    }

    Ok(())
}

#[derive(Debug, Deserialize, Serialize)]
struct Config {
    server_address: String,
    username: String,
    password: String,
    local_dir: String,
    remote_dir: String,
}

fn read_config_from_file() -> Result<Config, Box<dyn std::error::Error>> {
    let config_file = File::open("deploy.json")?;
    let config: Config = serde_json::from_reader(config_file)?;
    Ok(config)
}

pub fn deploy_fn() {
    println!("{}", "开始部署...".green());

    let config = match read_config_from_file() {
        Ok(config) => config,
        Err(err) => {
            eprintln!("Failed to read configuration from deploy.json: {}", err);
            return;
        }
    };

    let tcp = TcpStream::connect(config.server_address).unwrap();
    let mut sess = Session::new().unwrap();
    sess.set_tcp_stream(tcp);
    sess.handshake().unwrap();

    sess.userauth_password(&config.username, &config.password).unwrap();
    assert!(sess.authenticated());

    let sftp = sess.sftp().unwrap();

    let local_dir = Path::new(&config.local_dir);
    let remote_dir = Path::new(&config.remote_dir);

    match upload_directory(&sftp, local_dir, remote_dir) {
        Ok(_) => println!("{}", "部署成功！".green()),
        Err(err) => eprintln!("{}", format!("部署失败: {}", err.to_string()).red()),
    }
}
