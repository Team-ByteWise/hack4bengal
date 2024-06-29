let isExtensionActive = true;

document.addEventListener("DOMContentLoaded", () => {
  const body = document.getElementById("Body");
  const head_img = document.getElementById("head_img");
  const head_text = document.getElementById("head_text");
  const enable = document.getElementById("enable");
  const close = document.getElementById("close");

  const safeSite = () => {
    head_img.classList.remove("rotate");
    body.style.backgroundColor = "#C8FFDB";
    head_img.src = "images/safe.png";
    head_text.innerHTML = "This Site is Safe";
    head_text.style.color = "#20BF55";
    enable.src = "images/power_on.png";
  };

  const unsafeSite = () => {
    head_img.classList.remove("rotate");
    body.style.backgroundColor = "#ECD6D6";
    head_img.src = "images/not_safe.png";
    head_text.innerHTML = "Phishing Detected";
    head_text.style.color = "#DA0000";
    enable.src = "images/power_on.png";
  };

  const disableExtension = () => {
    head_img.classList.remove("rotate");
    body.style.backgroundColor = "#B5CFE8";
    head_img.src = "images/not_enable.png";
    head_text.innerHTML = "Click to Enable<br />WiseShield Ai";
    head_text.style.color = "#000000";
    enable.src = "images/power_off.png";
  };

  const scanningSite = () => {
    head_img.classList.add("rotate");
    body.style.backgroundColor = "#BCE2A4";
    head_img.src = "images/scanning.png";
    head_text.innerHTML = "WiseShield Ai is Enabled";
    head_text.style.color = "#000000";
    enable.src = "images/power_on.png";
  };

  close.addEventListener("click", () => {
    window.close();
  });

  chrome.storage.local.get(["isActive"], (result) => {
    isExtensionActive = result.isActive !== false;
    updateUI();
  });

  enable.addEventListener("click", () => {
    isExtensionActive = !isExtensionActive;
    chrome.storage.local.set({ isActive: isExtensionActive }, () => {
      updateUI();
    });
  });

  function updateUI() {
    if (isExtensionActive) {
      scanningSite();
      reQuery();
    } else {
      disableExtension();
    }
  }

  function updatePopup(data) {
    if (data.status === "real") {
      safeSite();
    } else if (data.status === "fake") {
      unsafeSite();
    }
  }

  function reQuery() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const url = new URL(currentTab.url);
      const baseUrl = url.origin + url.pathname;

      chrome.storage.local.get([baseUrl], (result) => {
        if (result[baseUrl] && isExtensionActive) {
          updatePopup(result[baseUrl]);
        }
      });

      chrome.runtime.sendMessage(
        { action: "requestLatestData", url: baseUrl },
        (response) => {
          if (response && isExtensionActive) updatePopup(response);
        }
      );
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "updatePopup") {
        console.log("Message received from background:", message.data);
        if (isExtensionActive) updatePopup(message.data);
      }
      return true;
    });
  }
  reQuery();
});
