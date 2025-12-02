// backend/models/Product.js
const mongoose = require('mongoose');
const sanitizeString = (value = "") =>
  typeof value === "string" ? value.replace(/[<>]/g, "").trim() : value;

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, set: sanitizeString },
  price: { type: Number, required: true },
  description: { type: String, required: true, trim: true, set: sanitizeString },
  stock: { type: Number, required: true },
}, {
  timestamps: true, // Ajoute createdAt et updatedAt
});

module.exports = mongoose.model('Product', productSchema);
