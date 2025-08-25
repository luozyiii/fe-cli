/// 应用配置
pub struct Config {
    pub api_base_url: String,
    pub request_timeout: u64,
    pub max_retries: u32,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            api_base_url: "http://81.71.98.176:3000".to_string(),
            request_timeout: 30, // 30 seconds
            max_retries: 3,
        }
    }
}

impl Config {
    /// 获取模板列表 API URL
    #[must_use]
    pub fn template_list_url(&self) -> String {
        format!("{}/template/list", self.api_base_url)
    }

    /// 获取添加模板 API URL
    #[must_use]
    pub fn template_add_url(&self) -> String {
        format!("{}/template/add", self.api_base_url)
    }
}

/// 全局配置实例
#[must_use]
pub fn get_config() -> Config {
    Config::default()
}
