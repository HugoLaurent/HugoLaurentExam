// backend/controllers/orderController.js
const axios = require("axios");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const orderLog = require("debug")("orderRoutes:console");

const GATEWAY_SERVICE_URL =
  process.env.GATEWAY_SERVICE_URL || "http://localhost:8000";
const VALID_PAYMENT_METHODS = ["Carte bancaire", "PayPal", "Virement"];
const VALID_SHIPPING_METHODS = ["colissimo", "chronopost"];
const sanitizeString = (value = "") =>
  typeof value === "string" ? value.replace(/[<>]/g, "").trim() : "";

exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, shippingMethod } = req.body;
  const userId = req.user.userId;

  try {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message:
          "Le corps de la requete doit contenir un tableau d'objets { productId, quantity, price }.",
      });
    }

    const orderDetails = [];
    for (let index = 0; index < items.length; index++) {
      const { productId, quantity, price } = items[index] || {};

      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          message: `productId invalide pour l'item #${index + 1}.`,
        });
      }

      const parsedQuantity = Number(quantity);
      if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({
          message: `Quantite invalide pour l'item #${index + 1}.`,
        });
      }

      const parsedPrice = Number(price);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          message: `Prix invalide pour l'item #${index + 1}.`,
        });
      }

      orderDetails.push({
        productId,
        quantity: parsedQuantity,
        price: parsedPrice,
      });
    }

    if (
      !shippingAddress ||
      typeof shippingAddress !== "object" ||
      Array.isArray(shippingAddress)
    ) {
      return res.status(400).json({
        message: "Adresse de livraison manquante ou invalide.",
      });
    }

    const requiredAddressFields = ["street", "city", "postalCode", "country"];
    const normalizedAddress = {};
    for (const field of requiredAddressFields) {
      const value = sanitizeString(shippingAddress[field]);
      if (!value) {
        return res.status(400).json({
          message: `Champ d'adresse "${field}" manquant ou invalide.`,
        });
      }
      normalizedAddress[field] = value;
    }

    const cleanPaymentMethod = sanitizeString(paymentMethod);
    if (!VALID_PAYMENT_METHODS.includes(cleanPaymentMethod)) {
      return res.status(400).json({
        message: "Methode de paiement invalide.",
      });
    }

    const cleanShippingMethod = sanitizeString(shippingMethod);
    if (!VALID_SHIPPING_METHODS.includes(cleanShippingMethod)) {
      return res.status(400).json({
        message: "Methode de livraison invalide.",
      });
    }

    const total = orderDetails.reduce(
      (acc, { price, quantity }) => acc + price * quantity,
      0
    );

    // Vérifier le stock disponible pour chaque produit
    const productIds = orderDetails.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== orderDetails.length) {
      return res.status(400).json({
        message: "Produit introuvable pour un des articles.",
      });
    }
    for (const item of orderDetails) {
      const product = products.find(
        (p) => p._id.toString() === item.productId.toString()
      );
      if (!product || product.stock <= 0 || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuffisant pour le produit ${item.productId}.`,
        });
      }
    }

    const newOrder = new Order({
      userId,
      items: orderDetails,
      total,
      shippingAddress: normalizedAddress,
      paymentMethod: cleanPaymentMethod,
      shippingMethod: cleanShippingMethod,
    });

    const savedOrder = await newOrder.save();

    try {
      await axios.post(`${GATEWAY_SERVICE_URL}/notify`, {
        to: "syaob@yahoo.fr",
        subject: "Nouvelle Commande Cree",
        text: `Une commande a ete creee avec succes pour les produits suivants : \n${orderDetails
          .map(
            (item) =>
              `Produit ID : ${item.productId}, Quantite : ${item.quantity}`
          )
          .join("\n")}`,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification", error);
    }

    res.status(201).json({
      message: "Commande creee avec succes",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Erreur lors de la creation de la commande", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la creation de la commande.",
    });
  }
};

// exports.createOrder = async (req, res) => {
//     const products = req.body; // Attente d'un tableau d'objets { productId, quantity }
//     console.log(`products are ${JSON.stringify(products)}`)

//     // // Verification du format des donnees
//     if (!Array.isArray(products.items) || products.items.length === 0) {
//       return res.status(400).json({ message: 'Le corps de la requete doit contenir un tableau d\'objets { productId, quantity }.' });
//     }

//     try {
//     //   // Logique pour traiter chaque produit de la commande
//       const orderDetails = products.items.map(({ productId, quantity }) => {
//         console.log(`Produit ID : ${productId}, Quantite : ${quantity}`);
//         return { productId, quantity };
//       });

//       //TODO : requete avec le modele order pour ajouter les commande en db

//     //   // Appel au micro-service de notification
//       try {
//         await axios.post('http://localhost:8000/notify', {
//           to: "syaob@yahoo.fr",
//           subject: 'Nouvelle Commande Cree',
//           text: `Une commande a ete creee avec succes pour les produits suivants : \n${orderDetails
//             .map((item) => `Produit ID : ${item.productId}, Quantite : ${item.quantity}`)
//             .join('\n')}`,
//         });
//       } catch (error) {
//         console.error('Erreur lors de l\'envoi de la notification', error);
//       }

//       // Appel au micro-service de gestion des stocks
//       try {
//         await Promise.all(
//           products.items.map(({ productId, quantity }) =>
//             axios.post('http://localhost:8000/update-stock', { productId, quantity })
//           )
//         );
//       } catch (error) {
//         console.error('Erreur lors de la mise a jour des stocks', error);
//       }

//       // Reponse de succes
//       res.status(201).json({
//         message: 'Commande creee avec succes',
//         orderDetails,
//       });
//     } catch (error) {
//       console.error('Erreur lors de la creation de la commande', error);
//       res.status(500).json({ message: 'Une erreur est survenue lors de la creation de la commande.' });
//     }
//   };

exports.deleteOrder = async (req, res) => {
  const { orderId } = req.body;
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find();
  res.status(200).json(orders);
};

exports.validateOrder = async (req, res) => {
  const { orderId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: "orderId invalide." });
  }
  res.status(200).json({ message: `Commande ${orderId} validee avec succes.` });
};

exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "orderId invalide." });
    }

    const cleanStatus = sanitizeString(status);
    const allowedStatuses = Order.schema.path("status")?.enumValues || [];
    if (!cleanStatus || !allowedStatuses.includes(cleanStatus)) {
      return res.status(400).json({ message: "Statut invalide." });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: cleanStatus, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Commande non trouvee." });
    }

    res.status(200).json({ message: "Statut mis a jour avec succes", order });
  } catch (error) {
    console.error("Erreur lors de la mise a jour de la commande :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

