let isSelecting = false;
let startX, startY;
let $selectionBox;
let $previewContainer;
let containerRect;

$(document).ready(function() {
  const $preview = $("#preview");
  $previewContainer = $(".preview-container");
  const $cropButton = $("#crop-button");
  const $downloadButton = $("#download-button");

  $downloadButton.on("click", downloadImage);
  $selectionBox = $("<div>")
    .attr("id", "selection-box")
    .css({
      position: "absolute",
      border: "3px dashed #0066cc",
      backgroundColor: "rgba(0, 102, 204, 0.1)",
      display: "none",
      zIndex: "1000",
      pointerEvents: "none"
    });
  $previewContainer.css("position", "relative");
  $previewContainer.append($selectionBox);
  $previewContainer.on("mousedown", function(e) {
    if (!$preview.attr("src")) return;
    
    if (isSelecting) {
      isSelecting = false;
      return;
    }
    isSelecting = true;
    containerRect = $previewContainer[0].getBoundingClientRect();
    startX = e.clientX - containerRect.left;
    startY = e.clientY - containerRect.top;
    startX = Math.max(0, Math.min(startX, containerRect.width));
    startY = Math.max(0, Math.min(startY, containerRect.height));
    $selectionBox.css({
      display: "block",
      left: startX + "px",
      top: startY + "px",
      width: "0px",
      height: "0px"
    });
  });
  $(document).on("mousemove", function(e) {
    if (!isSelecting) return;
    let currentX = e.clientX - containerRect.left;
    let currentY = e.clientY - containerRect.top;
    currentX = Math.max(0, Math.min(currentX, containerRect.width));
    currentY = Math.max(0, Math.min(currentY, containerRect.height));
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    $selectionBox.css({
      left: left + "px",
      top: top + "px",
      width: width + "px",
      height: height + "px"
    });
  });
  $cropButton.on("click", function() {
    const rect = $selectionBox[0].getBoundingClientRect();
    const previewRect = $preview[0].getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) {
      alert("Please make a selection first");
      return;
    }
    const scaleX = $preview[0].naturalWidth / previewRect.width;
    const scaleY = $preview[0].naturalHeight / previewRect.height;
    const x = Math.max(0, (rect.left - previewRect.left) * scaleX);
    const y = Math.max(0, (rect.top - previewRect.top) * scaleY);
    const width = rect.width * scaleX;
    const height = rect.height * scaleY;
    cropImage(x, y, width, height);
    $selectionBox.css("display", "none");
  });
});

function cropImage(x, y, width, height) {
  const $preview = $("#preview");
  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = function () {
    croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = width;
    croppedCanvas.height = height;

    const ctx = croppedCanvas.getContext("2d");
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
    $("#preview").attr("src", croppedCanvas.toDataURL("image/png"));


  };

  img.src = $preview.attr("src");
}


function downloadImage() {
  if (!croppedCanvas) {
    alert("Please crop the image first");
    return;
  }

  croppedCanvas.toBlob(function (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "screenshot_cropped.png";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  });
}

let croppedCanvas = null;
  