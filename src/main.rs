use clap::{App, Arg, SubCommand};
mod add;
use add::add_fun;
mod list;
use list::list_fun;
mod new;
use new::new_project;

fn main() {
    let matches = App::new("fe-cli")
        .version("1.0.0")
        .author("Your Name")
        .about("前端脚手架工具")
        .subcommand(
            SubCommand::with_name("add")
                .about("添加项目")
                .arg(
                    Arg::with_name("name")
                        .help("Sets the name of the item")
                        .required(true)
                        .index(1),
                ),
        )
        .subcommand(SubCommand::with_name("list").about("List all items"))
        .subcommand(
            SubCommand::with_name("new")
                .about("新建项目")
                .arg(
                    Arg::with_name("project_name")
                        .help("项目名称")
                        .required(true)
                        .index(1),
                ),
        )
        .get_matches();

    if let Some(matches) = matches.subcommand_matches("add") {
        let name = matches.value_of("name").unwrap();
        // 在这里处理 add 命令
        println!("Adding item: {}", name);
        add_fun();
    }

    if matches.subcommand_matches("list").is_some() {
        let _ = list_fun();
    }

    if let Some(matches) =  matches.subcommand_matches("new") {
        let project_name = matches.value_of("project_name").unwrap();
        println!("new a project: {}", project_name);
        new_project(&project_name);
    }
}
