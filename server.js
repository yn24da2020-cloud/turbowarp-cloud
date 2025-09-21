const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

const cloudVars = {}; // プロジェクトごとのクラウド変数保存用

wss.on('connection', ws => {
  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'set') {
        cloudVars[data.name] = data.value; // 変数保存
        // 接続中の全クライアントに送信
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'set', name: data.name, value: data.value }));
          }
        });
      }
    } catch(e) {
      console.error("Invalid message:", msg);
    }
  });

  // 接続時に既存の変数を送信して初期化
  for (const [name, value] of Object.entries(cloudVars)) {
    ws.send(JSON.stringify({ type: 'set', name, value }));
  }
});

console.log(`Server running on port ${PORT}`);
