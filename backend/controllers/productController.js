// controllers/productController.js
const mongoose = require('mongoose');
const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

exports.updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'productId invalide.' });
    }

    const parsedStock = Number(stock);
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ message: 'Le stock doit etre un nombre positif ou nul.' });
    }
    const safeStock = Math.floor(parsedStock);

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouve.' });
    }

    product.stock = safeStock;
    product.updatedAt = Date.now();

    await product.save();

    res.json({ message: 'Stock mis a jour avec succes.', product });
  } catch (error) {
    console.error('Erreur lors de la mise a jour du stock :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

