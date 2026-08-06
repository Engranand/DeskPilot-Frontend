(function () {
  const script = document.currentScript;
  const orgId = script.getAttribute("data-org-id");
  const widgetBaseUrl = "http://localhost:5173"; // production mein isko real domain se badlega

  if (!orgId) {
    console.error("DeskPilot Widget: data-org-id is required");
    return;
  }

  // Bubble button banao
  const bubble = document.createElement("button");
 bubble.innerHTML = "\u{1F4AC}"; // 💬 chat bubble
  bubble.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #0ea5e9;
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 999998;
  `;

  // Iframe banao (chhupa hua, jab tak bubble click na ho)
  const iframe = document.createElement("iframe");
  iframe.src = `${widgetBaseUrl}/widget?org=${orgId}`;
  iframe.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 380px;
    height: 560px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.25);
    z-index: 999999;
    display: none;
  `;

  let isOpen = false;
  bubble.addEventListener("click", () => {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? "block" : "none";
    bubble.innerHTML = isOpen ? "\u{2715}" : "\u{1F4AC}"; // ✕ : 💬
  });

  document.body.appendChild(iframe);
  document.body.appendChild(bubble);
})();