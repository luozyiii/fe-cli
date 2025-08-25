use serde::{Deserialize, Serialize};
use std::fmt;

/// 模板类型枚举
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TemplateType {
    Project,
    Component,
    Other,
}

impl TemplateType {
    /// 获取所有模板类型
    #[must_use]
    pub fn all() -> Vec<TemplateTypeOption> {
        vec![
            TemplateTypeOption {
                template_type: Self::Project,
                label: "项目".to_string(),
            },
            TemplateTypeOption {
                template_type: Self::Component,
                label: "组件".to_string(),
            },
            TemplateTypeOption {
                template_type: Self::Other,
                label: "其他".to_string(),
            },
        ]
    }

    /// 获取显示标签
    #[must_use]
    pub const fn label(&self) -> &'static str {
        match self {
            Self::Project => "【项目】",
            Self::Component => "【组件】",
            Self::Other => "【其他】",
        }
    }
}

impl fmt::Display for TemplateType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Project => write!(f, "project"),
            Self::Component => write!(f, "component"),
            Self::Other => write!(f, "other"),
        }
    }
}

impl From<&str> for TemplateType {
    fn from(s: &str) -> Self {
        match s {
            "project" => Self::Project,
            "component" => Self::Component,
            _ => Self::Other,
        }
    }
}

/// 模板类型选项
#[derive(Debug, Clone)]
pub struct TemplateTypeOption {
    pub template_type: TemplateType,
    pub label: String,
}

/// 模板信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Template {
    pub name: String,
    #[serde(rename = "type")]
    pub template_type: TemplateType,
    pub url: String,
}

/// 部署环境配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvironmentConfig {
    pub name: String,
    pub server_address: String,
    pub username: String,
    pub password: String,
    pub local_dir: String,
    pub remote_dir: String,
}

/// API 响应结构
#[derive(Debug, Deserialize)]
pub struct ApiResponse<T> {
    pub data: Option<T>,
    pub message: Option<String>,
}
