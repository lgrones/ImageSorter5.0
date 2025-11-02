use std::io;

pub trait Command: Send + Sync {
    fn execute(&self) -> Result<(), io::Error>;
    fn rollback(&self) -> Result<Vec<String>, io::Error>;
}
