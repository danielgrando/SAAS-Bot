import { Request, Response } from "express";
import { ErrorRequest } from "./customTypes";

export function resourceCreatedSuccess(res: Response) {
    res.status(201).json({ status: 'success' })
}

export function resourceUpdatedSuccess(res: Response) {
    res.status(200).json({ status: 'success' })
}

export function resourceDeletedSuccess(res: Response) {
    res.status(200).json({ status: 'success' })
}

export function customValidatorError(res: Response, errors: any, statusCode = 400) {
    res.status(statusCode).json({ status: 'error', errors })
}

export function resourceAlreadyExists(res: Response, resource: string) {
    const errorMessage: ErrorRequest = {
        status: 'error',
        message: `resource ${resource} already exists!`
    }

    res.status(409).json(errorMessage)
}

export function unableToSendRequest(res: Response) {
    const errorMessage: ErrorRequest = {
        status: 'error',
        message: `The store does not support the order type!`
    }

    res.status(403).json(errorMessage)
}


export function paymentRateDifferentToOrder(res: Response) {
    const errorMessage: ErrorRequest = {
        status: 'error',
        message: `The paymentRate is different to order! Please, select correctly!`
    }

    res.status(403).json(errorMessage)
}

export function resourceNotFound(res: Response, resource: string | number, complementResource?: string) {
    const resourceMessage = complementResource ? `resource ${complementResource}` : 'resource'

    const errorMessage: ErrorRequest = {
        status: 'error',
        message: `${resourceMessage} '${resource}' not found!`
    }

    res.status(404).json(errorMessage)
}

export function errorInRouter(req: Request, res: Response, error: any) {
    const errorMessage: ErrorRequest = {
        status: 'error',
        message: `an error ocurred in ${req.method} ${req.baseUrl}`,
        error: error?.message ? error.message : 'undefined'
    }

    console.error(error)

    res.status(400).send(errorMessage)
}

export function serviceCustomError(res: Response, serviceError: any): void {
    const errorMessage: ErrorRequest = {
        status: 'error',
        message: serviceError.error || 'An unknown error has ocurred'
    }

    res.status(serviceError.status || 500).json(errorMessage)
}