use dialoguer::{theme::ColorfulTheme, Select, Input};
use reqwest::Client;
use serde_json::json;
use colored::*;

struct TemplateTypeProps {
    value: String,
    label: String,
}

#[derive(Debug)]
pub struct TemplateProps {
    template_type: String,
    name: String,
    url: String,
}

pub async fn add_fn() {

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
    
    let options: Vec<&str> = template_type_options.iter().map(|obj| obj.label.as_str()).collect();

    let selection = Select::with_theme(&ColorfulTheme::default())
        .with_prompt("请选择模版类型")
        .default(0)
        .items(&options)
        .interact()
        .unwrap();

    let select_key = &template_type_options[selection].value;

    let name: String = Input::new()
        .with_prompt("请填写模版名称")
        .interact_text()
        .unwrap();

    let url: String = Input::new()
        .with_prompt("请填写模版git地址")
        .interact_text()
        .unwrap();

    let template = TemplateProps {
        template_type: select_key.to_string(),
        name,
        url,
    };

    if let Err(err) = save_template(&template).await {
        eprintln!("请求失败: {}", err);
    }
}


pub async fn save_template(template: &TemplateProps) -> Result<(), reqwest::Error> {

    let client = Client::new();
    let url = "http://81.71.98.176:3000/template/add";

    let json_data = json!({
        "type": template.template_type,
        "name": template.name,
        "url": template.url,
    });

    let response = client.post(url).json(&json_data).send().await?;

    if response.status().is_success() {
        println!("{}", "模板添加成功！".green());
    } else {
        println!("{}", "模板添加失败！".red());
    }

    Ok(())
}