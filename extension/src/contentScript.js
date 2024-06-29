function onDocumentReady(callback) {
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}

function checkSensitiveFields() {
  const forms = document.querySelectorAll("form");
  let passwordFieldFound = false;
  let keywordFound = false;
  let usernameFieldFound = false;

  forms.forEach((form) => {
    if (form.querySelector('input[type="password"]')) {
      passwordFieldFound = true;
    }

    const action = form.getAttribute("action") || "";
    if (
      action.includes("login") ||
      action.includes("signin") ||
      action.includes("signup")
    ) {
      keywordFound = true;
    }

    if (form.querySelector('input[type="text"][autocomplete="username"]')) {
      usernameFieldFound = true;
    }
  });

  if (passwordFieldFound || keywordFound || usernameFieldFound) {
    const url = window.location.href;
    const pageContent = document.documentElement.outerHTML;

    chrome.runtime.sendMessage({
      action: "logPageData",
      url: url,
      content: pageContent,
    });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateStatus") {
    if (message.isActive) {
      checkSensitiveFields();
    }
  }

  return true;
});

onDocumentReady(() => {
  chrome.storage.local.get(["isActive"], (result) => {
    const isActive = result.isActive !== false;
    if (isActive) {
      checkSensitiveFields();

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === "INPUT" && node.type === "password") {
                checkSensitiveFields();
              } else {
                const passwordFields = node.querySelectorAll(
                  'input[type="password"]'
                );
                const usernameFields = node.querySelectorAll(
                  'input[type="text"][autocomplete="username"]'
                );
                const forms = node.querySelectorAll("form");

                let formContainsKeyword = false;
                forms.forEach((form) => {
                  const action = form.getAttribute("action") || "";
                  if (
                    action.includes("login") ||
                    action.includes("signin") ||
                    action.includes("signup")
                  ) {
                    formContainsKeyword = true;
                  }
                });

                if (
                  passwordFields.length > 0 ||
                  usernameFields.length > 0 ||
                  formContainsKeyword
                ) {
                  checkSensitiveFields();
                }
              }
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  });
});
