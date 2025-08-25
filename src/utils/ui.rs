use crate::core::{AppError, AppResult, Template, TemplateType, EnvironmentConfig};
use dialoguer::{theme::ColorfulTheme, Select, Input};

/// 用户交互工具
pub struct UserInterface;

impl UserInterface {
    /// 选择模板类型
    pub fn select_template_type() -> AppResult<TemplateType> {
        let options = TemplateType::all();
        let labels: Vec<&str> = options.iter().map(|opt| opt.label.as_str()).collect();

        let selection = Select::with_theme(&ColorfulTheme::default())
            .with_prompt("请选择模版类型")
            .default(0)
            .items(&labels)
            .interact()?;

        Ok(options[selection].template_type.clone())
    }

    /// 选择模板
    pub fn select_template<'a>(templates: &'a [Template], template_type: &TemplateType) -> AppResult<&'a Template> {
        let filtered_templates: Vec<&Template> = templates
            .iter()
            .filter(|t| &t.template_type == template_type)
            .collect();

        if filtered_templates.is_empty() {
            return Err(AppError::Custom("没有找到匹配的模板".to_string()));
        }

        let template_names: Vec<&str> = filtered_templates
            .iter()
            .map(|t| t.name.as_str())
            .collect();

        let selection = Select::with_theme(&ColorfulTheme::default())
            .with_prompt("请选择模板")
            .default(0)
            .items(&template_names)
            .interact()?;

        Ok(filtered_templates[selection])
    }

    /// 选择部署环境
    pub fn select_environment(
        environments: &[EnvironmentConfig],
    ) -> AppResult<&EnvironmentConfig> {
        if environments.is_empty() {
            return Err(AppError::Custom("没有配置部署环境".to_string()));
        }

        let env_names: Vec<&str> = environments.iter().map(|env| env.name.as_str()).collect();

        let selection = Select::with_theme(&ColorfulTheme::default())
            .with_prompt("请选择部署环境")
            .default(0)
            .items(&env_names)
            .interact()?;

        Ok(&environments[selection])
    }

    /// 获取用户输入
    pub fn get_input(prompt: &str) -> AppResult<String> {
        let input: String = Input::new()
            .with_prompt(prompt)
            .interact()?;
        
        Ok(input)
    }
}
