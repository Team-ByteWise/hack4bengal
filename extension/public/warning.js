document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedFakeSiteUrl = urlParams.get("fakeSiteUrl");
  const encodedRealSiteUrl = urlParams.get("realSiteUrl");
  const encodedRealDomain = urlParams.get("realDomain");
  const encodedProbability = urlParams.get("probability");

  const fakeSiteUrl = atob(encodedFakeSiteUrl);
  var realSiteUrl = atob(encodedRealSiteUrl);
  const realDomain = atob(encodedRealDomain);
  const probability = parseInt(atob(encodedProbability), 10);

  if (
    !realSiteUrl.startsWith("http://") &&
    !realSiteUrl.startsWith("https://")
  ) {
    realSiteUrl = "https://" + realSiteUrl;
  }

  const fakeSiteUrlSpan = document.getElementById("fake_site_url");
  fakeSiteUrlSpan.innerHTML = fakeSiteUrl;

  const probabilitySpan = document.getElementById("fake_site_confidence");
  probabilitySpan.innerHTML = "Confidence: " + probability + "%";

  const realSiteButton = document.getElementById("real_site_button");
  realSiteButton.addEventListener("click", () => {
    window.location.href = realSiteUrl;
  });
});
