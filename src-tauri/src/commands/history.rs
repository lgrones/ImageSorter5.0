use std::sync::Arc;

use crate::commands::command::Command;

pub(crate) struct History {
    commands: Vec<Arc<dyn Command>>,
}

impl History {
    pub fn new() -> Self {
        Self { commands: vec![] }
    }

    pub fn execute(&mut self, command: Arc<dyn Command>) {
        let result = command.execute();
        self.commands.push(command);

        if let Err(_) = result {
            self.rollback();
        }
    }

    pub fn rollback(&mut self) -> Vec<String> {
        if let Some(command) = self.commands.pop() {
            if let Ok(paths) = command.rollback() {
                return paths;
            }
        }

        vec![]
    }
}
