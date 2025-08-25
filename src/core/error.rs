use std::fmt;

/// 应用错误类型
#[derive(Debug)]
pub enum AppError {
    /// 网络请求错误
    Network(reqwest::Error),
    /// JSON 解析错误
    Json(serde_json::Error),
    /// IO 错误
    Io(std::io::Error),
    /// Git 操作错误
    Git(git2::Error),
    /// SSH 错误
    Ssh(ssh2::Error),
    /// 用户交互错误
    Dialog(dialoguer::Error),
    /// 自定义错误
    Custom(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Network(e) => write!(f, "网络请求失败: {e}"),
            Self::Json(e) => write!(f, "JSON 解析失败: {e}"),
            Self::Io(e) => write!(f, "文件操作失败: {e}"),
            Self::Git(e) => write!(f, "Git 操作失败: {e}"),
            Self::Ssh(e) => write!(f, "SSH 连接失败: {e}"),
            Self::Dialog(e) => write!(f, "用户交互失败: {e}"),
            Self::Custom(msg) => write!(f, "{msg}"),
        }
    }
}

impl std::error::Error for AppError {}

impl From<reqwest::Error> for AppError {
    fn from(err: reqwest::Error) -> Self {
        Self::Network(err)
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        Self::Json(err)
    }
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        Self::Io(err)
    }
}

impl From<git2::Error> for AppError {
    fn from(err: git2::Error) -> Self {
        Self::Git(err)
    }
}

impl From<ssh2::Error> for AppError {
    fn from(err: ssh2::Error) -> Self {
        Self::Ssh(err)
    }
}

impl From<dialoguer::Error> for AppError {
    fn from(err: dialoguer::Error) -> Self {
        Self::Dialog(err)
    }
}

/// 应用结果类型
pub type AppResult<T> = Result<T, AppError>;
