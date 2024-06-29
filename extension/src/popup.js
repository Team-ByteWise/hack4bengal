let idx = 0;

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
    enable.src = "images/lock.png";
  };

  const unsafeSite = () => {
    head_img.classList.remove("rotate");
    body.style.backgroundColor = "#ECD6D6";
    head_img.src = "images/not_safe.png";
    head_text.innerHTML = "Phishing Detected";
    head_text.style.color = "#DA0000";
    enable.src = "images/lock.png";
  };

  const disableExtension = () => {
    head_img.classList.remove("rotate");
    body.style.backgroundColor = "#B5CFE8";
    head_img.src = "images/not_enable.png";
    head_text.innerHTML = "Click to Enable<br />WiseShield Ai";
    head_text.style.color = "#000000";
    enable.src = "images/unlock.png";
  };

  const scanningSite = () => {
    head_img.classList.add("rotate");
    body.style.backgroundColor = "#BCE2A4";
    head_img.src = "images/scanning.png";
    head_text.innerHTML = "WiseShield Ai is Enabled";
    head_text.style.color = "#000000";
    enable.src = "images/lock.png";
  };

  const closePopUp = () => {
    window.close();
  };

  function updateUI() {
    if (++idx >= 4) idx = 0;

    switch (idx) {
      case 0:
        safeSite();
        break;
      case 1:
        scanningSite();
        break;
      case 2:
        unsafeSite();
        break;
      case 3:
        disableExtension();
        break;
    }
  }

  enable.addEventListener("click", () => {
    updateUI();
  });
  close.addEventListener("click", () => {
    closePopUp();
  });
});
