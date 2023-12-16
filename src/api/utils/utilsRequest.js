export function resourceCreatedSuccess(res) {
    res.status(201).json({ status: 'success' })
}

export function resourceUpdatedSuccess(res) {
    res.status(200).json({ status: 'success' })
}

export function resourceDeletedSuccess(res) {
    res.status(200).json({ status: 'success' })
}

export function customValidatorError(res, errors, statusCode = 400) {
    res.status(statusCode).json({ status: 'error', errors })
}

export function resourceAlreadyExists(res, resource) {
    const errorMessage = {
        status: 'error',
        message: `resource ${resource} already exists!`
    }

    res.status(409).json(errorMessage)
}

export function unableToSendRequest(res) {
    const errorMessage = {
        status: 'error',
        message: `The store does not support the order type!`
    }

    res.status(403).json(errorMessage)
}


export function paymentRateDifferentToOrder(res) {
    const errorMessage = {
        status: 'error',
        message: `The paymentRate is different to order! Please, select correctly!`
    }

    res.status(403).json(errorMessage)
}

export function resourceNotFound(res, resource, complementResource) {
    const resourceMessage = complementResource ? `resource ${complementResource}` : 'resource'

    const errorMessage = {
        status: 'error',
        message: `${resourceMessage} '${resource}' not found!`
    }

    res.status(404).json(errorMessage)
}

export function errorInRouter(req, res, error) {
    const errorMessage = {
        status: 'error',
        message: `an error ocurred in ${req.method} ${req.baseUrl}`,
        error: error?.message ? error.message : 'undefined'
    }

    console.error(error)

    res.status(400).send(errorMessage)
}

export function serviceCustomError(res, serviceError) {
    const errorMessage = {
        status: 'error',
        message: serviceError.error || 'An unknown error has ocurred'
    }

    res.status(serviceError.status || 500).json(errorMessage)
}