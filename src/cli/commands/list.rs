use crate::core::AppResult;
use crate::utils::fetch_templates;
use colored::Colorize;

/// 列出所有模板命令
pub async fn list_command() -> AppResult<()> {
    let templates = fetch_templates().await?;

    if templates.is_empty() {
        println!("{}", "没有找到任何模板".yellow());
        return Ok(());
    }

    for template in templates {
        let colored_name = template.name.white();
        let colored_type = template.template_type.label().green();
        println!("{colored_type}{colored_name}");
    }

    Ok(())
}


