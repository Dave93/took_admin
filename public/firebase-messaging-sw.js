// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyDu4_6ZtApKGHNcl0PXORFyL42FGLHMeOQ",
  authDomain: "arryt-b201e.firebaseapp.com",
  projectId: "arryt-b201e",
  storageBucket: "arryt-b201e.appspot.com",
  messagingSenderId: "92327347967",
  appId: "1:92327347967:web:666cc5c7ad27855116eeca",
  measurementId: "G-HC0ZX4EJ81",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    data: payload.data,
    click_action: payload.notification.click_action,
  };
  console.log("notificationOptions", notificationOptions);

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Add an event listener for the notificationclick event
self.addEventListener("notificationclick", function (event) {
  console.log("before propagation");
  event.stopImmediatePropagation();
  console.log("after propagation");
  console.log("clients", self.clients);
  console.log("nofitication event", JSON.stringify(event));
  console.log("nofitication", event);
  let additionalData = {};
  if (
    event.notification.data != null &&
    event.notification.data["gcm.notification.data"]
  ) {
    additionalData = JSON.parse(
      event.notification.data["gcm.notification.data"]
    );
  }
  if (Object.keys(additionalData).length > 0) {
    self.clients
      .matchAll({ includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          console.log("client", client);
          if (
            additionalData.url &&
            client.url.includes("admin.arryt.uz") &&
            "navigate" in client
          ) {
            return client.postMessage({
              type: "openWindow",
              url: additionalData.url,
            });
            return client.navigate(additionalData.url);
          } else if (client.url == additionalData.url && "focus" in client) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(additionalData.url);
        }
      });
  }
  event.notification.close();
  event.waitUntil(async () => {});
});
