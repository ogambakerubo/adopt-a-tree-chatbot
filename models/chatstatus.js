var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Tracked client fields
var ChatStatusSchema = new Schema({
  user_id: { type: String, unique: true },
  seedling: {type: String, unique: true},
  quantity: Number,
  location: String,
  status: String
});

// Export module to index.js
module.exports = mongoose.model("ChatStatus", ChatStatusSchema);
