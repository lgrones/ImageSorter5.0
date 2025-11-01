pub trait Command: Send + Sync {
    fn execute(&self);
    fn rollback(&self) -> Vec<String>;
}
