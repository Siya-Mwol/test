const aes256 = require('aes256');
const Config = require('../../config')
const mddc=(Config.SESSION_ID);
let m = (mddc);
let mdm = m.replaceAll("inrl~", "");
let key = 'k!t';
let plaintext = (mdm);
let decryptedPlainText = aes256.decrypt(key, plaintext);

const mongoose = require("mongoose")
const BlockSchema = new mongoose.Schema({
id: { type: String,required: true },
reason : { type: String, default: "No Reason" },
group : { type: String, default: "In Private chat" },
user : { type: String, default: "bot" },
count : { type: String, default: 1 }
})
const warndb = mongoose.model("warndb", BlockSchema)

const GenID = decryptedPlainText;

async function setWarn(user, group, reson){
return new Promise(async(resolve,reject) => {
let newUser = user.includes(":") ? user.split(":")[0] : user.split("@")[0];
let newjid = group.split("@")[0];
let GenWarnId = GenID+newUser+newjid;
await warndb.findOne({ id: GenWarnId }).then(async(warn) => {
  if (!warn) {
   await new warndb({ id: GenWarnId, reason: reson, group: group, user: newUser, count: 1 }).save();
   } else {
   let counding = (warn.count)- -(1);
     await warndb.update(
     { id: GenWarnId, reason: reson, group: group, user: newUser, count: counding })
   }
})
   await warndb.findOne({ id: GenWarnId }).then(async(send) => {
if(send){
   resolve(send)
} else {
resolve('no data')
}
        })
   })
}
async function ResetWarn(user, group, reson){
return new Promise(async(resolve,reject) => {
let newUser = user.includes(":") ? user.split(":")[0] : user.split("@")[0];
let newjid = group.split("@")[0];
let GenWarnId = GenID+newUser+newjid;
await warndb.findOne({ id: GenWarnId }).then(async(warn) => {
  if (warn) {
     await warndb.deleteMany(
     { id: GenWarnId })
   }
})
   await warndb.findOne({ id: GenWarnId }).then(async(send) => {
if(send){
  resolve(send)
} else {
resolve('no data')
              }
        })
   })
}
async function ListWarn(groupID){
return new Promise(async(resolve,reject) => {
await warndb.find({ group: groupID }).then(async(getgrp) => {
  if (!getgrp) {
   resolve("no data found from this group jid");
   } else {
     resolve(getgrp)
            }
       })
  })
}
module.exports = { setWarn, ResetWarn, ListWarn }
//setWarn("120604@2","11@3","inrl")
//ListWarn("11@3")
//ResetWarn("10@2","11@3","inrl")
