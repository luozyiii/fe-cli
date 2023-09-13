use colored::*;
use dialoguer::{theme::ColorfulTheme, Select};
use git2::Repository;
use reqwest::Error;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;

struct TemplateTypeProps {
    value: String,
    label: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct Template {
    name: String,
    #[serde(rename = "type")]
    type_: String,
    url: String,
}

pub async fn new_fn(project_name: &str) {
    let template_type_options = vec![
        TemplateTypeProps {
            value: "project".to_string(),
            label: "项目".to_string(),
        },
        TemplateTypeProps {
            value: "component".to_string(),
            label: "组件".to_string(),
        },
        TemplateTypeProps {
            value: "other".to_string(),
            label: "其他".to_string(),
        },
    ];

    let tmp_options: Vec<&str> = template_type_options
        .iter()
        .map(|obj| obj.label.as_str())
        .collect();

    let tmp_selection = Select::with_theme(&ColorfulTheme::default())
        .with_prompt("请选择模版类型")
        .default(0)
        .items(&tmp_options)
        .interact()
        .unwrap();

    let tmp_type = &template_type_options[tmp_selection].value;

    let mut template_options = vec![];

    if let Ok(data) = get_template().await {
        template_options = data
    }

    let options: Vec<&str> = template_options
        .iter()
        .filter(|&x| x.type_ == tmp_type.as_str())
        .map(|obj| obj.name.as_str())
        .collect();

    let tmp = Select::with_theme(&ColorfulTheme::default())
        .with_prompt("请选择模板")
        .default(0)
        .items(&options)
        .interact()
        .unwrap();

    let select_key = &template_options[tmp].url;

    println!("正在下载模版...");

    let repo = match Repository::clone(select_key.as_str(), format!("./{}", project_name)) {
        Ok(repo) => repo,
        Err(e) => {
            eprintln!("模版下载失败: {}", e);
            return;
        }
    };

    if let Err(e) = fs::remove_dir_all(repo.path()) {
        eprintln!("根目录.git文件夹删除失败: {}", e);
        return;
    }

    println!("{}", "项目初始化完成！".green());
}

async fn get_template() -> Result<Vec<Template>, Error> {
    let url = "http://81.71.98.176:3000/template/list";
    let response = reqwest::get(url).await?;

    if response.status().is_success() {
        let body = response.text().await?;
        if let Ok(json) = serde_json::from_str::<Value>(&body) {
            if let Some(data) = json.get("data") {
                if let Some(template_arr) = data.as_array() {
                    let mut templates = Vec::new();
                    for template in template_arr {
                        if let Ok(template_data) =
                            serde_json::from_value::<Template>(template.clone())
                        {
                            templates.push(template_data);
                        }
                    }
                    return Ok(templates);
                }
            }
        } else {
            println!("无法解析响应为JSON: {:?}", body);
        }
    } else {
        println!("请求失败，状态码: {:?}", response.status());
    }
    Ok(Vec::new())
}
