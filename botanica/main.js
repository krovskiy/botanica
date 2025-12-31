function getRangeValue() {
  const slider = document.getElementById("slider");
  return parseInt(slider.value, 10);
}

document.getElementById("screenshot").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const deviceScaleFactor = 2;

  await chrome.debugger.attach({ tabId: tab.id }, "1.3");

  await chrome.debugger.sendCommand({ tabId: tab.id }, "Page.enable");

  await chrome.debugger.sendCommand({ tabId: tab.id }, "Emulation.setDeviceMetricsOverride", {
    width: 3840,
    height: 2160,
    deviceScaleFactor: getRangeValue(),
    mobile: false,
    scale: 1
  });

  await new Promise(resolve => setTimeout(resolve, 500));
  
  

  const screenshot = await chrome.debugger.sendCommand({ tabId: tab.id }, "Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true
  });
  const container = document.getElementById("preview");

  container.src = "data:image/png;base64," + screenshot.data;

  await chrome.debugger.sendCommand({ tabId: tab.id }, "Emulation.clearDeviceMetricsOverride");
  await chrome.debugger.detach({ tabId: tab.id });
});

document.getElementById("copy-button").addEventListener("click", async () => {
  const img = document.getElementById("preview");
  const copyBtn = document.getElementById("copy-button");
  
  if (!img.src) return;

  const response = await fetch(img.src);
  const blob = await response.blob();
  await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  
  const originalText = copyBtn.textContent;
  const originalBg = copyBtn.style.background;
  
  copyBtn.textContent = "Copied!";
  copyBtn.style.background = "#4faf4cff";
  
  setTimeout(() => {
    copyBtn.textContent = originalText;
    copyBtn.style.background = originalBg;
  }, 2000);
});
