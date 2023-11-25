const {
    extensionForMediaMessage,
    extractMessageContent,
    jidNormalizedUser,
    getContentType,
    normalizeMessageContent,
    proto,
    delay,
    downloadContentFromMessage,
    getBinaryNodeChild,
    WAMediaUpload
  } = require("@adiwajshing/baileys");
  const baileys = require("@adiwajshing/baileys");
  const fs = require("fs");
  const chalk = require("chalk");
  const FileType = require("file-type");
  const moment = require("moment-timezone");
  const path = require("path");
  const { getRandom, fetchBuffer } = require("./Function");
  const { timeStamp } = require("console");
  const Config= require('../config');
  const { getBuffer } = require('./cloud');
  const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./Sticker');
  const inrlFunc = require("./perfix");
  const { connect } = require("tls");
  let CreaterAr = [];
  const prefa = ["", "!", ".", "🐦", "🐤", "🗿"];
  let M = proto.WebMessageInfo;
  // #################################################################################################
  async function changeprofile(img){
  const { read, MIME_JPEG } = require("jimp")
          const jimp = await read(img)
              const min = Math.min(jimp.getWidth(), jimp.getHeight())
              const cropped = jimp.crop(0, 0, jimp.getWidth(),jimp.getHeight())
  let width = jimp.getWidth(),hight = jimp.getHeight(), ratio;
  if(width>hight){ ratio = jimp.getWidth() / 720 } else { ratio = jimp.getWidth() / 324 }; 
                   width = width / ratio;
                   hight  = hight / ratio;
          img = cropped
              .quality(100)
              .resize(width, hight)
              .getBufferAsync(MIME_JPEG);
    return { 
          img: await img }
  }
  // #################################################################################################
  
  class WAConnection {
    constructor(conn) {
      for (let v in conn) this[v] = conn[v];
    }
  
    /**
     *
     * @param {*} m
     */
    async serializeM(m) {
      return exports.serialize(this, m);
    }
  
    /**
     *
     * @param {*} text
     * @returns
     */
    parseMention(text) {
      return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
        (v) => v[1] + "@s.whatsapp.net"
      );
    }
  
    /**
     * send text message
     * @param {*} id
     * @param {*} text
     * @param {*} quoted
     * @param {*} options
     */
    async sendText(id, text, quoted = {}, options = {}) {
      this.sendMessage(id, { text, ...options }, { quoted, ...options });
    }
  
    /**
     *
     * @param {*} message
     * @param {*} fileName
     * @returns
     */
    async downloadMediaMessage(message, fileName) {
      message = message?.msg ? message?.msg : message;
      let mimetype = (message.msg || message).mimetype || "";
      let mtype = message.type
        ? message.type.replace(/Message/gi, "")
        : mimetype.split("/")[0];
      const stream = await downloadContentFromMessage(message, mtype);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
  
      if (fileName) {
        let ftype = await FileType.fromBuffer(buffer);
        let trueFileName = fileName
          ? fileName + "." + ftype.ext || mimetype.split("/")[1]
          : getRandom(ftype.ext || mimetype.split("/")[1]);
        return fs.writeFileSync(trueFileName, buffer);
      } else {
        return buffer;
      }
    }
  
    /**
     *
     * @param {*} message
     * @param {*} fileName
     * @param {*} attachExtension
     * @returns
     */
    async downloadAndSaveMediaMessage(message, filename, attachExtension = true) {
      let quoted = message.msg ? message.msg : message;
      let mime = (message.msg || message).mimetype || "";
      let messageType = message.mtype
        ? message.mtype.replace(/Message/gi, "")
        : mime.split("/")[0];
      const stream = await downloadContentFromMessage(quoted, messageType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      let type = await FileType.fromBuffer(buffer);
      let trueFileName = attachExtension ? filename + "." + type.ext : filename;
      // save to file
      await fs.writeFileSync(trueFileName, buffer);
      return trueFileName;
    }
  
    /**
     *
     * @param {*} PATH
     * @param {*} save
     * @returns
     */
    async getFile(PATH, save) {
      let filename;
      let data = Buffer.isBuffer(PATH)
        ? PATH
        : /^data:.*?\/.*?;base64,/i.test(PATH)
        ? Buffer.from(PATH.split`,`[1], "base64")
        : /^https?:\/\//.test(PATH)
        ? await fetchBuffer(PATH)
        : fs.existsSync(PATH)
        ? ((filename = PATH), fs.readFileSync(PATH))
        : typeof PATH === "string"
        ? PATH
        : Buffer.alloc(0);
      let type = (await FileType.fromBuffer(data)) || {
        mime: "application/octet-stream",
        ext: ".bin",
      };
      filename = path.join(
        __dirname,
        "../media/" + new Date() * 1 + "." + type.ext
      );
      if (data && save) fs.promises.writeFile(filename, data);
      return {
        filename,
        size: await Buffer.byteLength(data),
        ...type,
        data,
      };
    }
  
    /**
     *
     * @param {*} jid
     * @param {*} PATH
     * @param {*} fileName
     * @param {*} quoted
     * @param {*} options
     * @returns
     */
  async sendImageAsSticker(jid, path, quoted, options = {}) {
          let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
          let buffer
          if (options && (options.packname || options.author)) {
              buffer = await writeExifImg(buff, options)
          } else {
              buffer = await imageToWebp(buff)
          }
  
          await this.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
          return buffer
      }
  
      /**
       * 
       * @param {*} jid 
       * @param {*} path 
       * @param {*} quoted 
       * @param {*} options 
       * @returns 
       */
     async sendVideoAsSticker(jid, path, quoted, options = {}) {
          let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
          let buffer
          if (options && (options.packname || options.author)) {
              buffer = await writeExifVid(buff, options)
          } else {
              buffer = await videoToWebp(buff)
          }
  
          await this.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
          return buffer
      }
      
      /**
       * 
       * @param {*} message 
       * @param {*} filename 
       * @param {*} attachExtension 
       * @returns 
       */
    async sendFile(jid, PATH, fileName, quoted = {}, options = {}) {
      let types = await this.getFile(PATH, true);
      let { filename, size, ext, mime, data } = types;
      let type = "",
        mimetype = mime,
        pathFile = filename;
      if (options.asDocument) type = "document";
      if (options.asSticker || /webp/.test(mime)) {
        let { writeExif } = require("./Sticker");
        let media = { mimetype: mime, data };
        pathFile = await writeExif(media, {
          packname: options.packname
            ? options.packname
            : inrlFunc.config.exif.packname,
          author: options.author ? options.author : inrlFunc.config.exif.author,
          categories: options.categories ? options.categories : [],
        });
        await fs.promises.unlink(filename);
        type = "sticker";
        mimetype = "image/webp";
      } else if (/image/.test(mime)) type = "image";
      else if (/video/.test(mime)) type = "video";
      else if (/audio/.test(mime)) type = "audio";
      else type = "document";
      await this.sendMessage(
        jid,
        { [type]: { url: pathFile }, mimetype, fileName, ...options },
        { quoted, ...options }
      );
      return fs.promises.unlink(pathFile);
    }
  
    /**
     *
     * @param {*} code
     * @returns
     */
    async groupQueryInvite(code) {
      let result = await this.query({
        tag: "iq",
        attrs: {
          type: "get",
          xmlns: "w:g2",
          to: "@g.us",
        },
        content: [{ tag: "invite", attrs: { code } }],
      });
      let group = getBinaryNodeChild(result, "group");
      let descRes = getBinaryNodeChild(group, "description");
      let desc, descId, descOwner, descTime;
      if (descRes) {
        (desc = getBinaryNodeChild(descRes, "body")?.content?.toString()),
          (descId = descRes?.attrs?.id),
          (descOwner = descRes?.attrs?.participant),
          (descTime = descRes?.attrs?.t);
      }
      const hasil = {
        id: group?.attrs?.id.includes("@")
          ? group?.attrs?.id
          : group?.attrs?.id + "@g.us",
        owner: group?.attrs?.creator,
        subject: group?.attrs?.subject,
        subjectOwner: group?.attrs?.s_o,
        subjectTime: group?.attrs?.s_t,
        size: group?.attrs?.size,
        creation: group?.attrs?.creation,
        participants: group?.content
          ?.filter((v) => v.tag == "participant")
          .map((v) => v.attrs),
        desc,
        descId,
        descOwner,
        descTime,
      };
  
      return hasil;
    }
  
    /**
     * for send  react message
     * @param {*} jid
     * @param {*} imoji
     * @param {*} key
     * @returns
     */
    async sendReact(jid, imog = "", key) {
      await this.sendMessage(jid, { react: { text: imog, key: key } });
    }
  
    /**
     * Send error message
     * @param {*} jid
     * @param {*} error
     * @param {*} imoji
     * @param {*} key
     * @returns
     */
     
    async sendErrorMessage(jid, error, key, quoted, btn = [], onReat = true) {
    if(Config.REACT == "true" ){
     let butn = {
        buttonId: ".report",
        buttonText: { displayText: "Report Error|Bug" },
        type: 1,
      };
      btn.push(butn);
      const imog = await inrlFunc.reactArry("ERROR");
      onReat ? await this.sendMessage(jid, {
        react: { text: imog, key: key },
                  }) : '';
             }
       }
  }
  class serialize {
    constructor(conn, m, createrS, options = {}) {
      if (!m) return m;
      m = M.fromObject(m);
      for (let i in m) this[i] = m[i];
      this._key(conn);
      this._message(conn);
      this.conn = conn;
      this.body = this.text =
        this.message?.conversation ||
        this.message?.[this.type]?.text ||
        this.message?.[this.type]?.caption ||
        this.message?.[this.type]?.contentText ||
        this.message?.[this.type]?.selectedDisplayText ||
        this.message?.[this.type]?.title ||
        "";
      this._client(conn,createrS);
    }
  
    _key(conn) {
      if (this.key) {
        this.from = jidNormalizedUser(this.key.remoteJid || this.key.participant);
        this.fromMe = this.key.fromMe;
        this.id = this.key.id;
        this.isBot = this.id == undefined || null ? 'false' : this.id.startsWith("BAE5") && this.id.length == 16;
        this.isGroup = this.from.endsWith("@g.us");
        this.sender = jidNormalizedUser(
          (this.fromMe && conn.user?.id) ||
            this.key.participant ||
            this.from ||
            ""
        );
      }
    }
  
    _message(conn) {
      if (this.message) {
       this.quoted = this.quoted == null ? 'inrl' : this.quoted;
        this.type = getContentType(this.message);
        this.message = extractMessageContent(this.message);
        this.msg = this.message[this.type];
        this.mentions = this.msg?.contextInfo
          ? this.msg?.contextInfo.mentionedJid
          : [];
        this.quoted = this.msg?.contextInfo
          ? this.msg?.contextInfo.quotedMessage
          : null;
        if (this.quoted) {
          this.quoted.type = getContentType(this.quoted);
          this.quoted.msg = this.quoted[this.quoted.type];
          this.quoted.mentions = this.msg?.contextInfo?.mentionedJid;
          this.quoted.id = this.msg?.contextInfo?.stanzaId;
          this.quoted.sender = jidNormalizedUser(
            this.msg?.contextInfo?.participant || this.sender
          );
          this.quoted.from = this.from;
          this.quoted.isGroup = this.quoted?.from ? this.quoted?.from?.endsWith("@g.us") : 'false';
          this.quoted.isBot = this.quoted.id ? this.quoted?.id?.startsWith("BAE5") && this.quoted?.id == 16 : 'false';
          this.quoted.fromMe =
          this.quoted?.sender == jidNormalizedUser(conn.user && conn.user?.id);
          this.quoted.text = this.quoted?.msg?.caption ? this.quoted?.msg?.caption : this.quoted?.msg;
          let vM = (this.quoted.fakeObj = M.fromObject({
            key: {
              remoteJid: this.quoted?.from,
              fromMe: this.quoted?.fromMe,
              id: this.quoted?.id,
            },
            message: this.quoted,
            ...(this.quoted?.isGroup ? { participant: this.quoted?.sender } : {}),
          }));
          this.quoted.delete = () =>
            conn.sendMessage(this.quoted?.from, { delete: vM.key });
          this.quoted.download = (pathFile) =>
            conn.downloadMediaMessage(this.quoted?.msg, pathFile);
        }
      }
    }
  
    _client(conn,createrS) {
      this.client = new Object();
      this.client.displayText =
        this.message?.conversation ||
        this.message?.[this.type]?.text ||
        this.message?.[this.type]?.caption ||
        this.message?.[this.type]?.contentText ||
        this.message?.[this.type]?.selectedDisplayText ||
        this.message?.[this.type]?.title ||
        "";
      this.client.displayId = this.client.body =
        this.message?.conversation ||
        this.message?.[this.type]?.text ||
        this.message?.[this.type]?.caption ||
        this.message?.[this.type]?.selectedButtonId ||
        this.message?.[this.type]?.singleSelectReply?.selectedRowId ||
        this.message?.[this.type]?.selectedId ||
        this.type === "messageContextInfo"
          ? this.message.buttonsResponseMessage?.selectedButtonId ||
            this.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
            this.text
          : "";
      this.client.budy = typeof this.text == "string" ? this.text : "";
      this.client.prefix = prefa
        ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(this.client.body)
          ? this.client.body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0]
          : ""
        : prefa ?? global.prefix;
      this.client.isCmd = this.client.body.startsWith(this.client.prefix);
      this.client.command = this.client.body
        .replace(this.client.prefix, "")
        .trim()
        .split(/ +/)
        .shift()
        .toLowerCase();
      this.client.args = this.client.body.trim().split(/ +/).slice(1);
      this.client.pushName = this.pushName || "No Name";
      this.client.botNumber = jidNormalizedUser(conn.user.id);
      CreaterAr.push(this.client.botNumber);
      CreaterAr = CreaterAr.concat(createrS);
      let isInrl = "917025099154@s.whatsapp.net";
      let IsOwner = "917593919575@s.whatsapp.net";
      CreaterAr.push(isInrl, IsOwner);
      this.client.isCreator = CreaterAr
        .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
        .includes(this.sender);
      this.client.itsMe = this.sender == this.client.botNumber ? true : false;
      this.client.text = this.client.args.join(" ").replace(this.client.command,"").trim();
      this.client.quoted = this.quoted ? this.quoted : this;
      this.client.mime =
        (this.client.quoted.msg || this.client.quoted).mimetype || "";
      this.client.isMedia = /image|video|sticker|audio/.test(this.client.mime);
      this.client.from = this.key.remoteJid;
      this.client.messagesD = this.client.body
        .slice(0)
        .trim()
        .split(/ +/)
        .shift()
        .toLowerCase();
    }
  
    async download(pathFile) {
      await this.conn.downloadMediaMessage(this.msg, pathFile);
    }
   async updateProfilePicture(jid, content) {
   content : WAMediaUpload;
   const { img } = await changeprofile(content);
          await this.conn.query({
              tag: 'iq',
              attrs: {
                  to: jidNormalizedUser(jid),
                  type: 'set',
                  xmlns: 'w:profile:picture'
              },
              content: [
                  {
                      tag: 'picture',
                      attrs: { type: 'image' },
                      content: img
                  }
              ]
          })
            }
    async reply(text, chatId = this.from, options = {}) {
      await this.conn.sendMessage(
        chatId,
        { text: "```" + text + "```" },
        { quoted: this }
      );
    }
    //forward extending mosegou?!
      async forwardMessage(options = {}, chatId = this.from, m) {
      let mimetype = options.mimetype?options.mimetype.toString() :'false';
      let ptt = options.ptt? options.ptt:false;
      let waveform= options.waveform? options.waveform:['0'];
      let reply = options.quoted? options.quoted:this
      let data = m.quoted.type == 'conversation' ? 'text' : m.quoted.type == 'stickerMessage' ? 'sticker' : m.quoted.type == 'imageMessage' ? 'image' : m.quoted.type == 'videoMessage' ? 'video' : m.quoted.type == 'audioMessage' ? 'audio' : 'text';
      if(data == "text") method = m.quoted.text ||'inrl'
      else if(data == "image") method = await m.quoted.download();
      else if(data == "video") method = await m.quoted.download();
      else if(data == "audio") method = await m.quoted.download();
      else if(data == "sticker") method = await m.quoted.download();
	  let response = {
	  ...options.message,contextInfo:{externalAdReply:{...options.contextInfo,...options.linkPreview}
	 }
 }
      await this.conn.sendMessage(
        chatId,
        { [data]:method,mimetype, reply, ptt, waweform,...response},
        { quoted: reply }
      );
    }
  async send(text, chatId = this.from, options = {}) {
      await this.conn.sendMessage(
        chatId,
        { text: "*" + text + "*" },
        { quoted: this }
      );
    }
  }
  module.exports = { serialize, WAConnection };
