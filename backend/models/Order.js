const mongoose = require('mongoose');
const sanitizeString = (value = "") =>
  typeof value === "string" ? value.replace(/[<>]/g, "").trim() : value;

// Define the schema for individual order items
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the product in your database
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Au moins 1 produit est requis'],
  },
  price: {
    type: Number,
    required: true,
  },
});

// Define the schema for the entire order
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the user in your database
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema], // Array of order items
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['En attente', 'En cours de traitement', 'Expediee', 'Delivree', 'Annulee'],
      default: 'En attente',
      trim: true,
      set: sanitizeString,
    },
    shippingAddress: {
      street: { type: String, required: true, trim: true, set: sanitizeString },
      city: { type: String, required: true, trim: true, set: sanitizeString },
      postalCode: { type: String, required: true, trim: true, set: sanitizeString },
      country: { type: String, required: true, trim: true, set: sanitizeString },
    },
    paymentMethod: {
      type: String,
      enum: ['Carte bancaire', 'PayPal', 'Virement'],
      required: true,
      trim: true,
      set: sanitizeString,
    },
    shippingMethod: {
      type: String,
      enum: ['colissimo', 'chronopost'],
      required: true,
      trim: true,
      set: sanitizeString,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

