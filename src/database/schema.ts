import mongoose from 'mongoose'
const { Schema } = mongoose

const customerServiceSchema = new Schema({
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

export { CustomerService }