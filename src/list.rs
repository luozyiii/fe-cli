extern crate colored;
use colored::*;

struct OptionProps {
    label: &'static str,
    value: &'static str,
}

pub fn list_fun() {
    let raw_options = vec![
        OptionProps {label: "模版A", value: "wwww.a.com"},
        OptionProps {label: "模版B", value: "wwww.b.com"},
    ];
    for option in raw_options {
        println!("{}", option.label.green());
    }
}