use colored::*;
use reqwest::Error;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
struct Template {
    name: String,
    #[serde(rename = "type")]
    type_: String,
}

pub async fn list_fn() -> Result<(), Error> {
    let url = "http://81.71.98.176:3000/template/list";
    let response = reqwest::get(url).await?;

    if response.status().is_success() {
        let body = response.text().await?;
        if let Ok(json) = serde_json::from_str::<Value>(&body) {
            if let Some(data) = json.get("data") {
                if let Some(template_array) = data.as_array() {
                    for template in template_array {
                        if let Ok(template_data) =
                            serde_json::from_value::<Template>(template.clone())
                        {
                            let colored_name = format!("{}", template_data.name).white();
                            let colored_type = match template_data.type_.as_str() {
                                "project" => "【项目】".green(),
                                "component" => "【组件】".green(),
                                _ => "【其他】".green(),
                            };
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
