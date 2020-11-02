const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DetailSchema = new Schema({
    date:String,
    oxygen:String,
    temp:String,
    bp:String,
    other:String,
    
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      username: String
    }
});

module.exports = mongoose.model('Details',DetailSchema);