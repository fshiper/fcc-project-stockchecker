const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  stock: { type: String, required: true },
  price: { type: Number },
  likes: [String]
});
module.exports = mongoose.model("Stock", stockSchema);
