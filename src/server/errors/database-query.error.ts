export class DatabaseQueryError extends Error {
    constructor() {
        super('There is problem querying your database');
    }
}
