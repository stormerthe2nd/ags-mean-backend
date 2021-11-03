const mongoose = require("mongoose")
var d = new Date()
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

module.exports = mongoose.model("Post", mongoose.Schema({
  sno: { type: Number, required: true },
  imgPath: { type: Array, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  freeShip: { type: Boolean, required: true, default: false },
  des: { type: String, required: true },
  updated: {
    type: String, default: `${d.getDate()}-${months[d.getMonth()]}-${d.getFullYear()}`
  },
  active: { type: Boolean, default: true },
  category: { type: String, default: "Uncategorised" },
}))