use crate::core::{AppError, AppResult, Template};
use crate::utils::{fetch_templates, UserInterface};
use colored::Colorize;
use git2::Repository;
use std::fs;

/// 创建新项目命令
pub async fn new_command(project_name: &str) -> AppResult<()> {
    // 1. 选择模板类型
    let template_type = UserInterface::select_template_type()?;

    // 2. 获取模板列表
    let templates = fetch_templates().await?;

    // 3. 选择具体模板
    let selected_template = UserInterface::select_template(&templates, &template_type)?;

    // 4. 下载模板
    download_template(selected_template, project_name)?;

    println!("{}", "项目初始化完成！".green());
    Ok(())
}

/// 下载模板
fn download_template(template: &Template, project_name: &str) -> AppResult<()> {
    println!("正在下载模版...");

    let project_path = format!("./{project_name}");
    let repo = Repository::clone(&template.url, &project_path)?;

    // 删除 .git 目录
    if let Err(e) = fs::remove_dir_all(repo.path()) {
        return Err(AppError::Custom(format!(
            "删除 .git 目录失败: {e}"
        )));
    }

    Ok(())
}


