const { default: makeWASocket, useMultiFileAuthState } = require('@fizzxydev/baileys-pro');
const path = require('path');
const fs = require('fs');

const activeSessions = {};

async function getUserSocket(userId) {
  if (activeSessions[userId]) return activeSessions[userId];

  const sessionPath = path.join(__dirname, 'sessions', userId);
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const sock = makeWASocket({ auth: state, printQRInTerminal: false });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const jid = msg.key.remoteJid;

    if (text.startsWith('!')) {
      const [cmd, ...args] = text.slice(1).split(' ');
      switch (cmd.toLowerCase()) {
        case 'hello':
          await sock.sendMessage(jid, { text: 'Hey! 👋' });
          break;
        case 'help':
          await sock.sendMessage(jid, {
            text: `📚 Available Commands:\n!hello - Greet\n!time - Show time\n!echo <msg> - Repeat back your text`
          });
          break;
        case 'time':
          await sock.sendMessage(jid, { text: `🕒 Server time: ${new Date().toLocaleTimeString()}` });
          break;
        case 'echo':
          await sock.sendMessage(jid, { text: args.join(' ') || 'You didn’t say anything 🤷‍♂️' });
          break;
        default:
          // Ignore "Non-commands" text
      }
    }
  });

  activeSessions[userId] = sock;
  return sock;
}

module.exports = { getUserSocket };
