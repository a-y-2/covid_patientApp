const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdviceSchema = new Schema({
    date:String,
    advice:String,
    username:String

});

module.exports = mongoose.model('Advice',AdviceSchema);