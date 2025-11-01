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
        command.execute();
        self.commands.push(command);
    }

    pub fn rollback(&mut self) -> Vec<String> {
        if let Some(command) = self.commands.pop() {
            return command.rollback();
        }

        vec![]
    }
}
