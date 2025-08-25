use crate::core::{get_config, AppResult, ApiResponse, Template};
use crate::utils::HttpClient;
use std::time::Duration;

/// 获取模板列表
pub async fn fetch_templates() -> AppResult<Vec<Template>> {
    let config = get_config();
    let client = HttpClient::new(Duration::from_secs(config.request_timeout));

    let response: ApiResponse<Vec<Template>> = client
        .get(&config.template_list_url())
        .await?;

    Ok(response.data.unwrap_or_default())
}
