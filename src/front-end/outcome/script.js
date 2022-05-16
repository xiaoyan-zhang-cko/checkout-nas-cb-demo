const schemeIcon = document.getElementById("scheme");
const lastFour = document.getElementById("last-four");
const errorMessage = document.getElementById("error");
const outcome = document.getElementById("confirm-animation");
const toastBar = document.getElementById("toast_bar");
const backButton = document.querySelector(".back");
const approved = document.querySelector(".approved");
const cross =
  '<svg class="cross" viewBox="0 0 50 50"><path class="cross draw" fill="none" d="M16 16 34 34 M34 16 16 34"></path></svg>';

var theme = "";
var PAYMENT_ID = "";

// Socket so we can handle webhooks
var socket = io();

// Default theme to user's system preference
theme = getComputedStyle(document.documentElement).getPropertyValue("content");

// Apply cached theme on page reload
theme = localStorage.getItem("theme");

if (theme) {
  document.body.classList.add(theme);
}

// Get session ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const SESSION_ID = urlParams.get("cko-session-id");

const showOutcome = () => {
  // Get payment details
  http(
    {
      method: "POST",
      route: "/getPaymentBySession",
      body: {
        sessionId: SESSION_ID
      }
    },
    data => {
      console.log("Payment details: ", data);
      // Confirmation details
      if (data.approved) {
        PAYMENT_ID = data.id;
        approved.innerHTML = "Test payment approved!";
        outcome.style.backgroundColor = "var(--green)";
        outcome.classList.add("checkmark", "draw");

        schemeIcon.setAttribute(
          "src",
          "images/card-icons/" + data.source.scheme.toLowerCase() + ".svg"
        );
        schemeIcon.setAttribute("alt", data.source.scheme);
        schemeIcon.style.setProperty("display", "block");

        lastFour.innerHTML = "****" + data.source.last4;
      } else {
        approved.innerHTML = "Test payment failed";
        outcome.style.backgroundColor = "var(--red)";
        outcome.innerHTML = cross;
        outcome.classList.add("cross", "draw");
      }
    }
  );
};

// Utility function to send HTTP calls to our back-end API
const http = ({ method, route, body }, callback) => {
  let requestData = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };

  if (method.toLocaleLowerCase() === "get") {
    delete requestData.body;
  }

  // Timeout after 10 seconds
  timeout(10000, fetch(`${window.location.origin}${route}`, requestData))
    .then(res => res.json())
    .then(data => callback(data))
    .catch(er => (errorMessage.innerHTML = er));
};

// For connection timeout error handling
const timeout = (ms, promise) => {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error("Connection timeout"));
    }, ms);
    promise.then(resolve, reject);
  });
};

// Capture webhooks
socket.on("webhook", webhookBody => {
  if (webhookBody.paymentId !== PAYMENT_ID) {
    return;
  }
  let tempWebhook = webhookBody.type.replace("_", " ");

  let newToast = document.createElement("div");
  newToast.classList.add("toast_body");

  // WEBHOOK div
  let newWHDiv = document.createElement("div");
  newWHDiv.innerHTML = "WEBHOOK";
  newWHDiv.classList.add("wh_div");
  newToast.appendChild(newWHDiv);

  // Payment type div
  let newPTDiv = document.createElement("div");
  newPTDiv.innerHTML = tempWebhook;
  newPTDiv.classList.add("pt_div");
  newToast.appendChild(newPTDiv);

  toastBar.append(newToast);
  newToast.classList.add("show");

  setTimeout(function() {
    newToast.classList.remove("show");
    newToast.outerHTML = "";
  }, 5000);
});

// Go back to payment input
backButton.onclick = function() {
  location.replace('/');
}

showOutcome();
