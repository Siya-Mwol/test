const ezio = require("../lib/perfix");
const fs = require('fs');
const path = require('path');

ezio.inrl(
  {
    pattern: ["mtest"],
    dontAddCommandList: true,
    sucReact: "🎟",
  },
  async (message, client) => {
    const caption = `----inrl----`;
    const Message = {
      linkPreview: {
        "canonical-url": "https://aidarkezio.github.io",
        "matched-text": "https://aidarkezio.github.io",
        title: "fasweeh",
        description: "This is a WhatsApp user bot \n\nSend this number: Alive",
        jpegThumbnail: ezio.config.image.encd.D_E_ADEC,
      },
      text: caption,
    };
    const Message2 = {
      text: caption,
      contextInfo: {
        externalAdReply: {
          title: 'global.botname}',
          body: ` Gojo-Satoru`,
          previewType: "PHOTO",
          thumbnailUrl: ``,
          thumbnail: ezio.config.image.encd.D_E_TMB,
          sourceUrl: "https://telegra.ph/file/8bbe8a7de5c351dfcb077.jpg",
        },
      },
    };
    await client.sendMessage(
      message.from,
      Message,
      {
        quoted: message,
      }
    );
    await client.sendMessage(
      message.from,
      Message2,
      {
        quoted: message,
      }
    );
    global.catchError = false;
  }
);
