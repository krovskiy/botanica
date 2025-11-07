document.getElementById("screenshot").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const deviceScaleFactor = 2;

  await chrome.debugger.attach({ tabId: tab.id }, "1.3");

  await chrome.debugger.sendCommand({ tabId: tab.id }, "Page.enable");

  await chrome.debugger.sendCommand({ tabId: tab.id }, "Emulation.setDeviceMetricsOverride", {
    width: 2560,
    height: 1440,
    deviceScaleFactor,
    mobile: false,
    scale: 1
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  const screenshot = await chrome.debugger.sendCommand({ tabId: tab.id }, "Page.captureScreenshot", {
    format: "png"
  });
  const container = document.getElementById("preview");

  container.src = "data:image/png;base64," + screenshot.data;


  await chrome.debugger.sendCommand({ tabId: tab.id }, "Emulation.clearDeviceMetricsOverride");
  await chrome.debugger.detach({ tabId: tab.id });
});