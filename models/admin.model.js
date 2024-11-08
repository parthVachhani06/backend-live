const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
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
    type: String
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
 hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "hospital" },
//  hospital:{
//     type:String,
//  },
 password:{
    type:String,
 },
 agree:{
    type:Boolean,
   //  default:false,
 },
 token:{
   type:String,
 },
 is_active:{
    type:Boolean,
 },
 gender:{
    type:String,
 },
 image: {
   public_id: { type: String },
   url: { type: String },
 },

});

const Admin = mongoose.model('admin', adminSchema);
module.exports = Admin;