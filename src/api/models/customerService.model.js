const mongoose = require('mongoose')

const customerServiceSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true
  },
  storeId: {
    type: String,
    required: true
  }
}, { timestamps: true })

const CustomerService = mongoose.model('CustomerService', customerServiceSchema)

module.exports = CustomerService