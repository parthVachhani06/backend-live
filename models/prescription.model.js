const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
 patientId:{
    // type:String,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'patient',
 },
 doctorId:{
    // type:String,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'doctor',
 },
 mdecinename:{
    type:Array
 },strenght:{
    type:Array,
 },
 dose:{
    type:Array,
 },
 duration:{
    type:Array,
 },
 when_to_take:{
type:Array,
 },
 appointmentId:{
// type:String,
type: mongoose.Schema.Types.ObjectId,
ref: 'appointmentBook',
 },
 additional_notes:{
    type:String
 }
});

const Prescription = mongoose.model('prescription', prescriptionSchema);
module.exports = Prescription;