import { StatusCodes } from "http-status-codes";
import CustomError from "./customError";

export class UnauthenticatedError extends CustomError {
    constructor(message: string) {
        super(StatusCodes.UNAUTHORIZED, message);
    }
}

export class NotFoundError extends CustomError {
    constructor(message: string) {
        super(StatusCodes.NOT_FOUND, message);
    }
}


export class BadRequestError extends CustomError {
    constructor(message: string) {
        super(StatusCodes.BAD_REQUEST, message);
    }
}

export class ForbiddenError extends CustomError {
    constructor(message: string) {
        super(StatusCodes.FORBIDDEN, message);
    }
}

export class ConflictError extends CustomError {
    constructor(message: string) {
        super(StatusCodes.CONFLICT, message);
    }
}


export const CustomErrors = {
    UnauthenticatedError,
    NotFoundError,
    BadRequestError,
    ForbiddenError,
    ConflictError,
}
