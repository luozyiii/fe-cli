use crate::core::AppResult;
use std::fs;
use std::path::Path;

/// 文件系统工具
pub struct FileSystemUtils;

impl FileSystemUtils {
    /// 安全地删除目录
    pub fn remove_dir_all<P: AsRef<Path>>(path: P) -> AppResult<()> {
        let path = path.as_ref();
        if path.exists() {
            fs::remove_dir_all(path)?;
        }
        Ok(())
    }

    /// 创建目录（如果不存在）
    pub fn create_dir_all<P: AsRef<Path>>(path: P) -> AppResult<()> {
        let path = path.as_ref();
        if !path.exists() {
            fs::create_dir_all(path)?;
        }
        Ok(())
    }
}
