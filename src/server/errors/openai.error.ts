export class OpenaiError extends Error {
    constructor() {
        super('AI is not able to process request');
    }
}
