const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
 first_name:{
    type:String,
 },
 last_name:{
    type:String,
 },
 email:{
    type:String,
 },
 phone_number:{
    type: String,
 },
 otp: { type: String },
 country:{
    type:String,
 },
 state:{
    type:String,
 },
 city:{
    type:String,
 },
 password:{
    type:String,
 },
 agree:{
    type:Boolean,
    default:false,
 },
 token:{
   type:String,
 },
 is_active:{
    type:Boolean,
 },
 age:{
    type:Number,
 },
 height:{
    type:String,
 },
 weight:{
    type:String,
 },
 blood_group:{
    type:String,
 },
 dob:{
    type:Date
 },
patient_address:{
    type:String,
},
 gender:{
    type:String,
 },
 image: {
   public_id: { type: String },
   url: { type: String },
 },
 patient_issue:{
   type:String,
 },
 disease_name:{
   type:String
 }

});

const Patient = mongoose.model('patient', patientSchema);
module.exports = Patient;