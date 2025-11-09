
export default class CustomError extends Error {
    public status: number;
    public custom: boolean;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.custom = true;
    }
}
