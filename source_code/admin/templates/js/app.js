$.fn.exists = function () {
  return this.length !== 0;
};

let clients = [];
let focusedInterval = null;

function connectToWS(onMsg) {
  const socket = new WebSocket("ws://localhost:9999?_SS_KKI_D=admin");
  socket.addEventListener("open", function (event) {
    socket.send(
      JSON.stringify({
        content: "Hello there",
      })
    );
  });

  socket.addEventListener("message", function (event) {
    // console.log("Message from server ", event.data);
    if (onMsg) onMsg(JSON.parse(event.data));
  });

  return socket;
}

function onMsg(msgData) {
  if (msgData.img) {
    // check if client already exists
    let client = clients.find((c) => c.name == msgData.from);
    if (!client) {
      // if not exists then create new client
      clients.push({
        id: clients.length,
        name: msgData.from,
        img: msgData.img,
      });
      // otherwise, just change an image
    } else {
      client.img = msgData.img;
    }
    clients = [...new Set(clients)];
  }
}

function UpdateClients() {
  let clientsContainer = $("#clients");
  clients.forEach((client) => {
    // try to select client element
    let elId = `${client.name}-${client.id}`;
    let clientElement = $(`#${elId}`);
    // if not foun then add it
    if (!clientElement.exists()) {
      let htmlContent = `
        <div class="mini-screen-cont" id="${elId}" onclick="FocusScreen(${client.id})">
            <center>
                <img src="${client.img}" class='mini-img'/>
                <h3>${client.name}</h3>
            </center>
        </div>
        `;
      clientsContainer.append(htmlContent);
    } else {
      let element = $(`#${elId} img`);
      element.attr("src", client.img);
    }
  });
}

function CloseFocusedScreen() {
  clearInterval(focusedInterval);
  $("#focused-screen-cont").hide();
}

function FocusScreen(clientId) {
  let client = clients.find((c) => c.id == clientId);
  if (!client) return;
  // if client exists
  const UpdateInfo = function () {
    $("#focused-client-name").text(client.name);
    $("#focused-client-img").attr("src", client.img);
  };

  UpdateInfo();
  focusedInterval = setInterval(() => {
    UpdateInfo();
  }, 200);

  $("#focused-screen-cont").show();
}

$(document).ready(function () {
  const socket = connectToWS(onMsg);
  // interval to change the image every X ms
  UpdateClients();
  let chnagerInterval = setInterval(() => {
    UpdateClients();
  }, 500);
});
