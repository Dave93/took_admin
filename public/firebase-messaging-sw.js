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
  console.log(
    "Received background message ",
    JSON.stringify(payload.notification.data)
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    data: payload.notification.data,
    click_action: payload.notification.click_action,
  };

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
  self.clients
    .matchAll({ includeUncontrolled: true })
    .then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        console.log("client", client);
        if (event.notification.data != null) {
          if (
            event.notification.data.url &&
            client.url.includes("admin.arryt.uz") &&
            "navigate" in client
          ) {
            return client.navigate(event.notification.data.url);
          } else if (
            client.url == event.notification.data.url &&
            "focus" in client
          ) {
            return client.focus();
          }
        }
      }
      if (event.notification.data != null) {
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      }

      event.notification.close();
    });
  event.waitUntil(async () => {});
});
