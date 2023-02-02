export class DatabaseConnectionError extends Error {
  constructor() {
    super('It is not possible to connect to following database');
  }
}
