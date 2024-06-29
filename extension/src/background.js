chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isActive: true });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && "isActive" in changes) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs
          .sendMessage(tab.id, {
            action: "updateStatus",
            isActive: changes.isActive.newValue,
          })
          .catch((error) => {});
      });
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "logPageData") {
    const url = new URL(message.url);
    const baseUrl = url.origin + url.pathname;

    fetch("http://localhost:5000/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: message.url,
        content: message.content,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.status === "error") {
          console.error("Error:", data.error);
          return;
        }

        const statusData = {};
        statusData[baseUrl] = data;
        chrome.storage.local.set(statusData, () => {
          chrome.runtime
            .sendMessage({
              action: "updatePopup",
              data: data,
              url: baseUrl,
            })
            .catch((error) => {});

          if (data.status === "fake") {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              const fakeUrl = chrome.runtime.getURL("warning.html");
              const url = new URL(message.url);
              const baseUrl = url.origin + url.pathname;

              const encodedFakeSiteUrl = btoa(baseUrl);
              const encodedRealSiteUrl = btoa(data.real_url);
              const encodedRealDomain = btoa(data.real_domain);
              const encodedProbability = btoa(
                Math.round(data.probability * 100).toString()
              );
              const fakePageUrl = `${fakeUrl}?fakeSiteUrl=${encodedFakeSiteUrl}&probability=${encodedProbability}&realDomain=${encodedRealDomain}&realSiteUrl=${encodedRealSiteUrl}`;
              chrome.tabs.update(tabs[0].id, { url: fakePageUrl });
            });
          }
        });
      })
      .catch((error) => {
        console.log("ERROR:", "Backend server is not running");
      });
  }
  return true;
});
