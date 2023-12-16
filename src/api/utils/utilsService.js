
exports.jsonStringify = (data) => {
  try {
    return JSON.stringify(data)
  } catch {
    return null
  }
}

exports.printErrorInService = (error, service, method) => {
  console.error(`
  ######################################################################################
    An error occurred in the request!
    [SERVICE: ${service}  METHOD: ${method}]


    REQUEST CONFIG: ${this.jsonStringify(error?.response?.config)}

    REQUEST DATA: ${this.jsonStringify(error?.response?.data || error?.response || undefined)}
  
    ERROR MESSAGE: ${this.jsonStringify(error?.response?.message)}

    ERROR: ${jsonStringify(error)}
  ######################################################################################
  `)
}

exports.printInfoMessage = (message) => {
  console.info(message)
}

