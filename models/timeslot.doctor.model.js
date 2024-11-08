const mongoose = require('mongoose');

const doctimeslotSchema = new mongoose.Schema({
 timeslot:{
    type:String,
 }
});

const DocTimeSlot = mongoose.model('doctimeslot', doctimeslotSchema);
module.exports = DocTimeSlot;