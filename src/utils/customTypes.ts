export type ErrorRequest = {
    status: 'error',
    message: string,
    error?: string
}

export interface ResponseServicePagination {
    totalResults: number
    offset: number
    limit: number
    sort?: {
        [name: string]: 'ASC' | 'DESC'
    },
    items?: any[]
}

export type ResultRequest = {
    status: number,
    data?: any,
    error?: string
}

