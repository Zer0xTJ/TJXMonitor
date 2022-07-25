const http = require("http");
const WebSocket = require("ws");
const { WebSocketServer } = WebSocket;

const server = http.createServer();
const wss = new WebSocketServer({
  server,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  },
});

function MakeMsg(obj) {
  return JSON.stringify(obj);
}

function CheckAdmin(request) {
  let pair = request.url?.substring(2).split("=");
  if (pair[0] == "_SS_KKI_D" && pair[1] == "admin") {
    return true;
  }
  return false;
}

function CleanName(name) {
  return name.replace(/[^A-Za-z0-9\s]/g, "").replace(/\s{2,}/g, "_");
}

wss.on("connection", function connection(ws, request) {
  if (CheckAdmin(request)) {
    ws.isAdmin = true;
  }

  ws.on("message", function message(data) {
    let jsonData = JSON.parse(data);
    // console.log("received: ", jsonData);
    if (jsonData.type == "img" && jsonData.name) {
      SendToAdmin(
        MakeMsg({
          from: CleanName(jsonData.name),
          img: jsonData.img,
        })
      );
    }
  });
  ws.send(MakeMsg({ content: "From Server!" }));
  //   SendToAdmin(MakeMsg({ content: "Too Admin" }));
});

function SendToAdmin(msg) {
  let adminClient = [...wss.clients].find((c) => c.isAdmin);
  if (adminClient) {
    if (adminClient.readyState === WebSocket.OPEN) {
      adminClient.send(msg);
    }
  }
}

function SendToAll(msg) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

server.listen(9999);
