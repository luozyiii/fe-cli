use dialoguer::{theme::ColorfulTheme, Select};
use git2::Repository;
use std::fs;
use indicatif::{ProgressBar, ProgressStyle};

struct OptionProps {
    label: &'static str,
    value: &'static str,
}

pub fn new_project(project_name: &str) {
    let raw_options = vec![
        OptionProps {label: "NestJS 模版", value: "https://github.com/luozyiii/nest-best"},
        OptionProps {label: "vite-antd-pc 模版", value: "https://github.com/luozyiii/vite-antd-pc"},
    ];

    let options: Vec<&str> = raw_options.iter().map(|obj| obj.label.clone()).collect();

    let selection = Select::with_theme(&ColorfulTheme::default())
        .with_prompt("请选择模版")
        .default(0)
        .items(&options)
        .interact()
        .unwrap();

    let selected_value = raw_options[selection].value;
    // println!("选择的值: {}", selected_value);

    println!("正在下载模版...");
    let repo = match Repository::clone(selected_value, "./".to_owned() + project_name) {
        Ok(repo) => repo,
        Err(e) => {
            eprintln!("Failed to clone: {}", e);
            return;
        }
    };

    if let Err(e) = fs::remove_dir_all(repo.path()) {
        eprintln!("Failed to remove .git directory: {}", e);
        return;
    }

    println!("模板下载成功，项目初始化完成！");
}