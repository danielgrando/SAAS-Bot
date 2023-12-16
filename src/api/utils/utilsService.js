
function jsonStringify(data) {
  try {
    return JSON.stringify(data)
  } catch {
    return null
  }
}

module.exports.printErrorInService = (error, service, method) => {
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

exports.printInfoMessage = (message) => {
  console.info(message)
}

