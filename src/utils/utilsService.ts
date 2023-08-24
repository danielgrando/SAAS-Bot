
function jsonStringify(data: any) {
  try {
    return JSON.stringify(data)
  } catch {
    return null
  }
}

export function printErrorInService(error: any, service: string, method: string): void {
  console.error(`
  ######################################################################################
    An error occurred in the request!
    [SERVICE: ${service}  METHOD: ${method}]


    REQUEST CONFIG: ${jsonStringify(error?.response?.config)}

    REQUEST DATA: ${jsonStringify(error?.response?.data || error?.response || undefined)}
  
    ERROR MESSAGE: ${jsonStringify(error?.response?.message)}

    ERROR: ${jsonStringify(error)}
  ######################################################################################
  `)
}


export function printInfoMessage(message: any): void {
  console.info(message)
}