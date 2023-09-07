use reqwest::Error;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio;
extern crate colored;
use colored::*;

#[derive(Debug, Serialize, Deserialize)]
struct Template {
    name: String,
    #[serde(rename = "type")]
    type_: String,
    // Add other fields here if needed
}

#[tokio::main]
pub async fn list_fun() -> Result<(), Error> {
    // 设置要请求的URL
    let url = "http://81.71.98.176:3000/template/list";

    // 发送HTTP GET请求
    let response = reqwest::get(url).await?;

    // 检查响应的状态码
    if response.status().is_success() {
        // 将响应的内容解析为JSON
        let body = response.text().await?;
        if let Ok(json) = serde_json::from_str::<Value>(&body) {
            // 获取JSON中的"data"字段
            if let Some(data) = json.get("data") {
                // 遍历"data"字段中的数组
                if let Some(template_array) = data.as_array() {
                    for template in template_array {
                        // 尝试将每个模板解析为Template结构体
                        if let Ok(template_data) = serde_json::from_value::<Template>(template.clone()) {
                            let colored_name = format!("{}", template_data.name).green();
                            let colored_type = format!("【{}】", template_data.type_).green();
                            println!("{}{}", colored_type, colored_name);
                        }
                    }
                }
            }
        } else {
            println!("无法解析响应为JSON: {:?}", body);
        }
    } else {
        println!("请求失败，状态码: {:?}", response.status());
    }

    Ok(())
}
