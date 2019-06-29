var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Tracked client fields
var ChatStatusSchema = new Schema({
  user_id: { type: String, unique: true },
  orders: [
    {
      seedling: String,
      quantity: Number,
      location: String,
      completed_order: Boolean
    }
  ],
  status: String
});

// Export module to index.js
module.exports = mongoose.model("ChatStatus", ChatStatusSchema);
