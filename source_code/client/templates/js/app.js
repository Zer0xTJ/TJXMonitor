// let clientName;
// let IP;
// let senderInterval;

// $(document).ready(function () {
//   LoadFields();
// });
// function ConnectToWS() {
//   IP = $("#ip").val();
//   clientName = $("#name").val();
//   SaveFields(IP, clientName);

//   let socket = new WebSocket(`ws://${IP}`);
//   socket.addEventListener("open", function (event) {
//     senderInterval = setInterval(() => {
//       socket.send(
//         JSON.stringify({
//           name: clientName,
//           img: $("#screenshot-image").attr("src"),
//           type: "img",
//         })
//       );
//     }, 200);

//     $("#connected").show();
//     $("#disconnected").hide();
//   });

//   socket.addEventListener("close", function () {
//     $("#connected").hide();
//     $("#disconnected").show();
//     clearInterval(senderInterval);
//   });

//   socket.addEventListener("message", function (event) {
//     //console.log("Message from server ", event.data);
//   });
// }

// function SaveFields(ip, clientName) {
//   localStorage.setItem("ip", ip);
//   localStorage.setItem("name", clientName);
// }

// function LoadFields() {
//   IP = localStorage.getItem("ip") || "localhost:9999";
//   clientName = localStorage.getItem("name") || "TJX-Client";

//   $("#ip").val(IP);
//   $("#name").val(clientName);
// }
