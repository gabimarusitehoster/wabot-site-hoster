const express = require('express');
const cors = require('cors');
const path = require('path');
const { getUserSocket } = require('./socketManager');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/pair/:userId/:phone', async (req, res) => {
  try {
    const sock = await getUserSocket(req.params.userId);
    const code = await sock.requestPairingCode(req.params.phone.replace(/\D/g, ''));
    res.json({ pairingCode: code });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
