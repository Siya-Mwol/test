const aes256 = require('aes256');
const Config = require('../../config')
let plaintext = Config.SESSION_ID.replaceAll("inrl~", "");
let key = 'k!t';
let decryptedPlainText = aes256.decrypt(key, plaintext);
const mongoose = require("mongoose")
const pluginSchema = new mongoose.Schema({
id: { type: String,required: true },
url : { type: String },
name : { type : String }
})
const  pluginDB = mongoose.model("pluginDB", pluginSchema)

async function add_plugin(name, url){
await pluginDB.find({ name : decryptedPlainText+name }).then(async(plugin) => {
if(!plugin[0]){
await new pluginDB({ id: decryptedPlainText, url : url, name : decryptedPlainText+name }).save();
   } else {
    pluginDB.findOneAndUpdate(
     { name : decryptedPlainText+name },{ url: url })
      }
  })
}
async function dlt_plugin(name){
await pluginDB.find({
    name: decryptedPlainText+name.trim()
}).then(async(und) => {
if(und[0]){
   console.log(und)
await pluginDB.deleteMany({ name:decryptedPlainText+name.trim() });
   }});
}
async function getListOfPlugin(){
return new Promise(async(resolve,reject) => {
await pluginDB.find({ id: decryptedPlainText }).then(async(isPlugin) => {
if(isPlugin[0]){
resolve(isPlugin);
} else resolve('no data')
       })
   })
}
module.exports = { pluginDB, add_plugin, dlt_plugin, getListOfPlugin }
