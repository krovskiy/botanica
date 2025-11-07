let isSelecting = false;
let startX, startY;
let $selectionBox;
let $previewContainer;

$(document).ready(function() {
  const $preview = $("#preview");
  $previewContainer = $(".preview-container");
  const $cropButton = $("#crop-button");
  $selectionBox = $("<div>")
    .attr("id", "selection-box")
    .css({
      position: "absolute",
      border: "2px dashed #0066cc",
      backgroundColor: "rgba(0, 102, 204, 0.1)",
      display: "none",
      zIndex: "1000",
      pointerEvents: "none"
    });
  $previewContainer.append($selectionBox);
  $previewContainer.on("mousedown", function(e) {
    if (!$preview.attr("src")) return;
    isSelecting = true;
    const rect = $previewContainer[0].getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
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
    const rect = $previewContainer[0].getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
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
  $(document).on("mouseup", function() {
    isSelecting = false;
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
  img.onload = function() {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
    const croppedData = canvas.toDataURL("image/png");
    $preview.attr("src", croppedData);
    const a = document.createElement("a");
    a.href = croppedData;
    a.download = "screenshot_cropped.png";
    a.click();
  };

  img.src = $preview.attr("src");
}