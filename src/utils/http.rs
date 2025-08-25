use crate::core::{AppError, AppResult};
use std::time::Duration;

/// HTTP 客户端工具
pub struct HttpClient {
    client: reqwest::Client,
}

impl HttpClient {
    /// 创建新的 HTTP 客户端
    #[must_use]
    pub fn new(timeout: Duration) -> Self {
        let client = reqwest::Client::builder()
            .timeout(timeout)
            .build()
            .expect("Failed to create HTTP client");
        
        Self { client }
    }

    /// 发送 GET 请求
    pub async fn get<T>(&self, url: &str) -> AppResult<T>
    where
        T: serde::de::DeserializeOwned,
    {
        let response = self.client.get(url).send().await?;
        
        if !response.status().is_success() {
            return Err(AppError::Custom(format!(
                "HTTP 请求失败，状态码: {}",
                response.status()
            )));
        }

        let body = response.text().await?;
        let data: T = serde_json::from_str(&body)?;
        Ok(data)
    }

    /// 发送 POST 请求
    pub async fn post<T, R>(&self, url: &str, data: &T) -> AppResult<R>
    where
        T: serde::Serialize,
        R: serde::de::DeserializeOwned,
    {
        let response = self.client.post(url).json(data).send().await?;
        
        if !response.status().is_success() {
            return Err(AppError::Custom(format!(
                "HTTP 请求失败，状态码: {}",
                response.status()
            )));
        }

        let body = response.text().await?;
        let result: R = serde_json::from_str(&body)?;
        Ok(result)
    }
}
