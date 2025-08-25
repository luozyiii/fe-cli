use crate::core::{get_config, AppResult, ApiResponse, TemplateType};
use crate::utils::{HttpClient, UserInterface};
use colored::Colorize;
use serde_json::json;
use std::time::Duration;

#[derive(Debug)]
struct NewTemplate {
    template_type: TemplateType,
    name: String,
    url: String,
}

/// 添加模板命令
pub async fn add_command() -> AppResult<()> {
    // 1. 选择模板类型
    let template_type = UserInterface::select_template_type()?;

    // 2. 获取模板名称
    let name = UserInterface::get_input("请填写模版名称")?;

    // 3. 获取模板 Git 地址
    let url = UserInterface::get_input("请填写模版git地址")?;

    // 4. 创建模板对象
    let template = NewTemplate {
        template_type,
        name,
        url,
    };

    // 5. 保存模板
    save_template(&template).await?;

    println!("{}", "模板添加成功！".green());
    Ok(())
}

/// 保存模板到服务器
async fn save_template(template: &NewTemplate) -> AppResult<()> {
    let config = get_config();
    let client = HttpClient::new(Duration::from_secs(config.request_timeout));

    let json_data = json!({
        "type": template.template_type.to_string(),
        "name": template.name,
        "url": template.url,
    });

    let _response: ApiResponse<serde_json::Value> = client
        .post(&config.template_add_url(), &json_data)
        .await?;

    Ok(())
}
