const prototype = document.querySelector("#prototype");
const prototypeBar = document.querySelector(".prototype-bar");
const projectShell = document.querySelector("[data-project-shell]");

const months = [
  ["January", "Jan"], ["February", "Feb"], ["March", "Mar"], ["April", "Apr"],
  ["May", "May"], ["June", "Jun"], ["July", "Jul"], ["August", "Aug"],
  ["September", "Sep"], ["October", "Oct"], ["November", "Nov"], ["December", "Dec"],
];
const monthAppearance = months.map(() => ({ background: "#FFFFFF", textMode: "auto", customTextColor: "#1E211F" }));
const incompleteMonths = new Set([3, 7, 10]);
const states = { entry: "first", assign: "partial", editor: "ready", review: "incomplete" };
let currentScene = "editor";
let currentBackground = "#FFFFFF";
let textColorMode = "auto";
let customTextColor = "#1E211F";
let fontPreset = "editorial";
let fontScale = "standard";
let selectedMonthIndex = 0;
let pngFeedbackTimer;
let zipFeedbackTimer;

function activateButton(selector, activeButton) {
  document.querySelectorAll(selector).forEach((button) => {
    const active = button === activeButton;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setScene(scene) {
  currentScene = scene;
  if (scene === "review") renderReview(states.review);
  prototype.dataset.scene = scene;
  document.querySelectorAll(".scene[data-scene]").forEach((section) => {
    section.hidden = section.dataset.scene !== scene;
  });
  projectShell.hidden = scene === "entry";
  document.querySelectorAll("[data-nav-scene]").forEach((button) => {
    const active = button.dataset.navScene === scene;
    button.classList.toggle("is-current", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-scene-button]").forEach((button) => {
    const active = button.dataset.sceneButton === scene;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll(".state-controls").forEach((group) => {
    group.hidden = !group.classList.contains(`${scene}-state-controls`);
  });
  syncStateButtons();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function syncStateButtons() {
  const group = document.querySelector(`.${currentScene}-state-controls`);
  if (!group) return;
  group.querySelectorAll("[data-state-button]").forEach((button) => {
    const active = button.dataset.stateButton === states[currentScene];
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setEntryState(state) {
  states.entry = state;
  document.querySelector(".first-entry").hidden = state !== "first";
  document.querySelector(".returning-entry").hidden = state !== "returning";
}

function photoVisual(isMissing, monthName) {
  if (isMissing) {
    return `<div class="assignment-visual missing-card-visual"><div class="missing-card-inner"><span class="plus-mark" aria-hidden="true">+</span><span>Add Photo</span></div></div>`;
  }
  return `<div class="assignment-visual"><img src="assets/sample-photo.svg" alt="Prototype photo assigned to ${monthName}" /></div>`;
}

function renderAssign(state) {
  states.assign = state;
  const grid = document.querySelector("#assignGrid");
  const count = state === "full" ? 12 : state === "empty" ? 0 : 9;
  document.querySelector("#assignCount").textContent = `${count} of 12 months ready`;
  const addPhotos = document.querySelector("#assignAddPhotos");
  addPhotos.hidden = state === "full";
  addPhotos.className = state === "empty" ? "button button-primary" : "button button-secondary";
  document.querySelector("#assignContinueButton").className = state === "empty" ? "button button-secondary" : "button button-primary";
  grid.innerHTML = months.map(([name], index) => {
    const missing = state === "empty" || (state === "partial" && incompleteMonths.has(index));
    const warning = state === "partial" && index === 5;
    return `<article class="assignment-card">
      ${warning ? '<span class="warning-badge">! Low resolution</span>' : ""}
      <button class="assignment-card-button" type="button" data-context-kind="${missing ? "missing" : "ready"}" data-context-month="${name}">
        ${photoVisual(missing, name)}
        <span class="assignment-meta"><strong>${name}</strong><span class="assignment-status ${missing ? "missing" : "ready"}">${missing ? "Missing Photo" : "Ready"}</span><span class="card-affordance" aria-hidden="true">•••</span></span>
      </button>
    </article>`;
  }).join("");

  const unassignedSection = document.querySelector("#unassignedSection");
  unassignedSection.hidden = state !== "partial";
  document.querySelector("#unassignedGrid").innerHTML = ["Photo 13", "Photo 14"].map((name, index) => `
    <button class="unassigned-card" type="button" data-context-kind="unassigned" data-context-month="${name}">
      <img src="assets/sample-photo.svg" alt="${name}, unassigned prototype photo" style="filter:hue-rotate(${index ? -38 : 26}deg)" />
      <span><strong>${name}</strong><br />Unassigned</span><b aria-hidden="true">•••</b>
    </button>`).join("");
}

function setEditorState(state) {
  states.editor = state;
  const missing = state === "missing";
  document.querySelector(".ready-photo").hidden = missing;
  document.querySelector(".missing-photo").hidden = !missing;
  document.querySelector(".ready-controls").hidden = missing;
  document.querySelector(".missing-controls").hidden = !missing;
  document.querySelector(".ready-export").hidden = missing;
  document.querySelector(".missing-export").hidden = !missing;
  document.querySelector(".ready-mobile-actions").hidden = missing;
  document.querySelector(".missing-mobile-actions").hidden = !missing;
  document.querySelector(".ready-copy").hidden = missing;
  document.querySelector(".missing-copy").hidden = !missing;
  document.querySelector(".status-ready").hidden = missing;
  document.querySelector(".status-missing").hidden = !missing;
}

function miniCalendar(month, missing, index) {
  const appearance = monthAppearance[index];
  const ink = appearance.textMode === "auto" ? contrastColor(appearance.background) : appearance.customTextColor;
  const style = `style="--calendar-bg:${appearance.background};--calendar-ink:${ink}"`;
  if (missing) {
    return `<div class="mini-proof" ${style}><div class="mini-missing"><span aria-hidden="true">+</span></div><div class="mini-calendar" lang="en"><header><strong>${month}</strong><span>2027</span></header><div class="mini-week">${"SMTWTFS".split("").map(() => "<i></i>").join("")}</div><div class="mini-dates">${Array.from({ length: 28 }, () => "<i></i>").join("")}</div></div></div>`;
  }
  return `<div class="mini-proof" ${style}><div class="mini-photo"><img src="assets/sample-photo.svg" alt="" /></div><div class="mini-calendar" lang="en"><header><strong>${month}</strong><span>2027</span></header><div class="mini-week">${"SMTWTFS".split("").map(() => "<i></i>").join("")}</div><div class="mini-dates">${Array.from({ length: 28 }, () => "<i></i>").join("")}</div></div></div>`;
}

function renderReview(state) {
  states.review = state;
  const complete = state === "complete";
  const count = complete ? 12 : 9;
  document.querySelector("#reviewCount").textContent = `${count} of 12 months ready`;
  document.querySelector("#reviewSummary").textContent = complete
    ? "Every month is ready. Review the set or download all twelve calendar images together."
    : "Your ready months can download now. Add photos to finish the complete set.";
  document.querySelector("#missingLinks").hidden = complete;

  document.querySelector("#reviewGrid").innerHTML = months.map(([name], index) => {
    const missing = !complete && incompleteMonths.has(index);
    return `<article class="review-card">
      <div class="review-proof-wrap">${miniCalendar(name, missing, index)}</div>
      <div class="review-card-meta"><strong>${name}</strong><span class="review-card-state ${missing ? "missing" : "ready"}">${missing ? "Missing Photo" : "Ready"}</span></div>
      <div class="review-card-actions">${missing
        ? `<button class="button button-secondary single" type="button" data-go-editor-state="missing">Add Photo</button>`
        : `<button class="button button-quiet" type="button" data-go-editor-state="ready">Edit</button><button class="button button-secondary" type="button" data-export="png-progress">PNG</button>`}</div>
    </article>`;
  }).join("");

  const zipButton = document.querySelector("#zipButton");
  const addMissing = document.querySelector("#addMissingButton");
  if (complete) {
    document.querySelector("#zipHeading").textContent = "Your complete 2027 calendar set";
    document.querySelector("#zipCopy").textContent = "One ZIP containing 12 PNGs, ordered from 01 through 12.";
    zipButton.disabled = false;
    zipButton.textContent = "Download 12-Month ZIP";
    zipButton.className = "button button-primary";
    zipButton.dataset.export = "zip-progress";
    addMissing.hidden = true;
  } else {
    document.querySelector("#zipHeading").textContent = "Complete the set to download one ZIP";
    document.querySelector("#zipCopy").textContent = "Add photos to April, August, and November. Ready-month PNG downloads remain available.";
    zipButton.disabled = true;
    zipButton.textContent = "ZIP unavailable";
    zipButton.className = "button";
    delete zipButton.dataset.export;
    addMissing.hidden = false;
  }
}

function renderMonthNavigation() {
  const buttons = months.map(([name], index) => {
    const missing = incompleteMonths.has(index);
    return `<button class="${index === 0 ? "is-selected" : ""}" type="button" data-month-index="${index}" aria-current="${index === 0 ? "true" : "false"}"><span>${index + 1}月</span><i class="state-dot ${missing ? "missing" : "ready"}" aria-hidden="true"></i><span class="sr-only">${missing ? "Missing Photo" : "Ready"}</span></button>`;
  }).join("");
  document.querySelector("#desktopMonthList").innerHTML = buttons;
  document.querySelector("#monthSwitcherGrid").innerHTML = months.map(([name], index) => {
    const missing = incompleteMonths.has(index);
    return `<button class="month-choice ${index === 0 ? "is-current" : ""} ${missing ? "is-missing" : ""}" type="button" data-month-index="${index}"><span>${name}</span><small>${missing ? "+ Missing Photo" : "✓ Ready"}</small></button>`;
  }).join("");
}

function setSelectedMonth(index) {
  if (index < 0 || index >= months.length) return;
  selectedMonthIndex = index;
  const appearance = monthAppearance[index];
  textColorMode = appearance.textMode;
  customTextColor = appearance.customTextColor;
  document.querySelectorAll(".text-color-picker").forEach((input) => { input.value = customTextColor; });
  document.querySelectorAll(".text-color-hex").forEach((input) => { input.value = customTextColor; });
  setBackground(appearance.background);
  const name = months[index][0];
  document.querySelector(".month-selector span:first-child").textContent = `${name} 2027`;
  document.querySelector("#editorTitle").textContent = `${name} 2027`;
  document.querySelector(".calendar-title-row h2").textContent = name;
  document.querySelector(".calendar-proof").setAttribute("aria-label", `${name} 2027 calendar preview`);
  const days = document.querySelector(".calendar-days");
  days.setAttribute("aria-label", `${name} 2027, Sunday-first calendar`);
  const firstDay = new Date(2027, index, 1).getDay();
  const numberOfDays = new Date(2027, index + 1, 0).getDate();
  days.innerHTML = Array.from({ length: 42 }, (_, cell) => {
    const day = cell - firstDay + 1;
    return `<span>${day >= 1 && day <= numberOfDays ? day : ""}</span>`;
  }).join("");
  document.querySelectorAll("#desktopMonthList [data-month-index]").forEach((button) => {
    const active = Number(button.dataset.monthIndex) === index;
    button.classList.toggle("is-selected", active);
    button.setAttribute("aria-current", String(active));
  });
  document.querySelectorAll("#monthSwitcherGrid [data-month-index]").forEach((button) => button.classList.toggle("is-current", Number(button.dataset.monthIndex) === index));
  setEditorState(incompleteMonths.has(index) ? "missing" : "ready");
  document.querySelector(".export-section [data-export]").textContent = `Download ${name} PNG`;
  document.querySelector(".missing-control-section h2").textContent = `${name} needs a photo`;
  document.querySelector("#backgroundDialog .dialog-header p").textContent = `为 ${index + 1} 月选个背景色。`;
  document.querySelector("#pngSurface .png-progress-state strong").textContent = `正在准备 ${index + 1} 月 PNG…`;
  document.querySelector("#pngSurface .png-result-state strong").textContent = `${index + 1} 月 PNG 已准备好。`;
}

function applyState(state) {
  if (currentScene === "entry") setEntryState(state);
  if (currentScene === "assign") renderAssign(state);
  if (currentScene === "editor") setEditorState(state);
  if (currentScene === "review") renderReview(state);
  syncStateButtons();
}

function closeOpenDialogs() {
  document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
}

function openDialog(id) {
  const dialog = document.getElementById(id);
  if (!dialog) return;
  closeOpenDialogs();
  dialog.showModal();
}

function configureContext(kind, name) {
  const kicker = document.querySelector("#contextKicker");
  const title = document.querySelector("#contextDialogTitle");
  const actions = document.querySelector("#contextActions");
  if (kind === "missing") {
    kicker.textContent = `${name} · Missing Photo`;
    title.textContent = `Fill ${name}`;
    actions.innerHTML = `<button type="button" data-context-action="picker">Choose a New Photo</button>${states.assign === "partial" ? '<button type="button" data-context-action="assign">Use an Unassigned Photo</button>' : ""}`;
  } else if (kind === "unassigned") {
    kicker.textContent = "Unassigned Photo";
    title.textContent = "Photo actions";
    actions.innerHTML = `<button type="button" data-context-action="assign">Assign to Month</button><button class="danger-list-action" type="button" data-context-action="delete">Delete Photo from this calendar…</button>`;
  } else {
    kicker.textContent = `${name} · Ready`;
    title.textContent = "Photo actions";
    actions.innerHTML = `<button type="button" data-context-action="edit">Edit ${name}</button><button type="button" data-context-action="picker">Replace Photo</button>${states.assign !== "full" ? '<button type="button" data-context-action="move">Move to Empty Month</button>' : ""}<button type="button" data-context-action="swap">Swap with Another Month</button><button type="button" data-context-action="remove">Remove from ${name}</button><button type="button" data-context-action="reuse">Use in Another Month</button>`;
  }
  openDialog("contextDialog");
}

function configureCommit(kind, target) {
  const title = document.querySelector("#commitDialogTitle");
  const copy = title.nextElementSibling;
  const commit = document.querySelector("#commitDialog .button-primary");
  const targetMonth = months.findIndex(([name]) => name === target) + 1;
  if (kind === "swap") {
    title.textContent = `交换 1 月和 ${targetMonth} 月的照片？`;
    copy.textContent = `交换后两张照片会重新居中，1 月和 ${targetMonth} 月的背景色不变。`;
    commit.textContent = "交换照片";
  } else {
    title.textContent = `替换 ${targetMonth} 月的照片？`;
    copy.textContent = `原来 ${targetMonth} 月的照片会移到未分配照片。新照片会居中，${targetMonth} 月的背景色不变。`;
    commit.textContent = "替换照片";
  }
  openDialog("commitDialog");
}

function openDestination(mode = "move") {
  const title = document.querySelector("#destinationDialogTitle");
  const help = document.querySelector("#destinationHelp");
  const labels = {
    move: ["Move photo", "Choose an empty month. The photo starts centered; month colors stay."],
    swap: ["Swap with another month", "Choose a Ready month. Both photos start centered; month colors stay."],
    assign: ["Assign photo to a month", "Choose any month. An occupied month asks before its current photo is displaced."],
    reuse: ["Use photo in another month", "The source month stays unchanged. The new use has its own crop and background."],
  };
  [title.textContent, help.textContent] = labels[mode];
  document.querySelector("#destinationList").innerHTML = months.map(([name], index) => {
    const missing = incompleteMonths.has(index);
    const current = index === 0;
    let disabled = current;
    if (mode === "move") disabled = current || !missing;
    if (mode === "swap") disabled = current || missing;
    const state = current ? "Current" : missing ? "Missing Photo" : "Ready";
    const action = disabled ? "Unavailable" : "Choose ›";
    return `<button class="destination-choice" type="button" data-destination-mode="${mode}" data-destination-name="${name}" data-destination-occupied="${String(!missing)}" ${disabled ? "disabled" : ""}><strong>${name}</strong><small>${state}</small><span>${action}</span></button>`;
  }).join("");
  openDialog("destinationDialog");
}

function showPngSurface(state, autoAdvance = false) {
  clearTimeout(pngFeedbackTimer);
  const surface = document.querySelector("#pngSurface");
  surface.hidden = false;
  surface.querySelector(".png-progress-state").hidden = state !== "progress";
  surface.querySelector(".png-result-state").hidden = state !== "result";
  if (state === "progress" && autoAdvance) pngFeedbackTimer = setTimeout(() => { if (!surface.hidden) showPngSurface("result"); }, 1200);
}

function openZip(state, autoAdvance = false) {
  clearTimeout(zipFeedbackTimer);
  const dialog = document.querySelector("#zipDialog");
  dialog.querySelector(".zip-progress-state").hidden = state !== "progress";
  dialog.querySelector(".zip-success-state").hidden = state !== "success";
  dialog.querySelector(".zip-failure-state").hidden = state !== "failure";
  dialog.querySelector("#zipDialogTitle").textContent = state === "progress" ? "Preparing 12-Month ZIP" : state === "success" ? "Export complete" : "Export problem";
  openDialog("zipDialog");
  if (state === "progress" && autoAdvance) zipFeedbackTimer = setTimeout(() => { if (dialog.open) openZip("success"); }, 1400);
}

function openSurface(value) {
  const surfaces = {
    "context-ready": () => configureContext("ready", "January"),
    "context-missing": () => configureContext("missing", "April"),
    "context-unassigned": () => configureContext("unassigned", "Photo 13"),
    destination: () => openDestination("move"),
    delete: () => openDialog("deleteDialog"),
    new: () => openDialog("newProjectDialog"),
    save: () => { document.querySelector("#saveBanner").hidden = false; window.scrollTo({ top: 0, behavior: "instant" }); },
    conflict: () => openDialog("conflictDialog"),
    "png-progress": () => showPngSurface("progress"),
    "png-result": () => showPngSurface("result"),
    "zip-progress": () => openZip("progress"),
    "zip-success": () => openZip("success"),
    "zip-failure": () => openZip("failure"),
  };
  surfaces[value]?.();
}

function contrastColor(hex) {
  const background = luminance(hex);
  const dark = luminance("#1E211F");
  return (background + 0.05) / (dark + 0.05) >= 1.05 / (background + 0.05) ? "#1E211F" : "#FFFFFF";
}

function luminance(hex) {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function syncCalendarText() {
  const ink = textColorMode === "auto" ? contrastColor(currentBackground) : customTextColor;
  document.documentElement.style.setProperty("--calendar-ink", ink);
  document.querySelectorAll("[data-text-mode]").forEach((button) => {
    const active = button.dataset.textMode === textColorMode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll(".custom-text-fields").forEach((fields) => { fields.hidden = textColorMode !== "custom"; });
  document.querySelectorAll(".auto-text-help").forEach((help) => { help.hidden = textColorMode !== "auto"; });
  const lighter = Math.max(luminance(currentBackground), luminance(ink));
  const darker = Math.min(luminance(currentBackground), luminance(ink));
  document.querySelectorAll(".text-contrast-warning").forEach((warning) => { warning.hidden = textColorMode !== "custom" || (lighter + 0.05) / (darker + 0.05) >= 4.5; });
}

function setCustomTextColor(value) {
  const color = validHex(value);
  if (!color) return;
  customTextColor = color;
  monthAppearance[selectedMonthIndex].customTextColor = color;
  document.querySelectorAll(".text-color-picker").forEach((input) => { input.value = color; });
  document.querySelectorAll(".text-color-hex").forEach((input) => { input.value = color; });
  syncCalendarText();
}

function setFontPreset(preset) {
  if (!["editorial", "clean", "handwritten"].includes(preset)) return;
  fontPreset = preset;
  document.documentElement.dataset.calendarPreset = preset;
  document.querySelectorAll("[data-font-preset]").forEach((button) => {
    const active = button.dataset.fontPreset === fontPreset;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setFontScale(scale) {
  const values = { small: 0.9, standard: 1, large: 1.08 };
  if (!(scale in values)) return;
  fontScale = scale;
  document.documentElement.style.setProperty("--calendar-type-scale", String(values[scale]));
  document.querySelectorAll("[data-font-scale]").forEach((button) => {
    const active = button.dataset.fontScale === fontScale;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function validHex(value) {
  const candidate = value.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(candidate) ? candidate : null;
}

function setBackground(hex) {
  const color = validHex(hex);
  if (!color) return;
  currentBackground = color;
  monthAppearance[selectedMonthIndex].background = color;
  document.documentElement.style.setProperty("--calendar-bg", color);
  syncCalendarText();
  const values = [1, 3, 5].map((start) => Number.parseInt(color.slice(start, start + 2), 16));
  ["backgroundColor", "missingBackgroundColor", "sheetBackgroundColor"].forEach((id) => { const input = document.getElementById(id); if (input) input.value = color; });
  ["backgroundHex", "missingBackgroundHex", "sheetBackgroundHex"].forEach((id) => { const input = document.getElementById(id); if (input) input.value = color; });
  [["backgroundR", 0], ["backgroundG", 1], ["backgroundB", 2], ["missingBackgroundR", 0], ["missingBackgroundG", 1], ["missingBackgroundB", 2], ["sheetBackgroundR", 0], ["sheetBackgroundG", 1], ["sheetBackgroundB", 2]].forEach(([id, index]) => {
    const input = document.getElementById(id); if (input) input.value = String(values[index]);
  });
  document.querySelectorAll("[data-color]").forEach((swatch) => swatch.classList.toggle("is-selected", swatch.dataset.color.toUpperCase() === color));
}

function rgbToHex(prefix) {
  const values = ["R", "G", "B"].map((channel) => {
    const value = Number(document.getElementById(`${prefix}${channel}`).value);
    return Math.min(255, Math.max(0, Number.isFinite(value) ? value : 0));
  });
  return `#${values.map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`;
}

function setZoom(value) {
  const numeric = Number(value);
  document.documentElement.style.setProperty("--photo-scale", String(numeric / 100));
  document.querySelectorAll(".zoom-input").forEach((input) => { input.value = String(numeric); });
  document.querySelectorAll("#zoomValue, #mobileZoomValue").forEach((output) => { output.value = `${numeric}%`; output.textContent = `${numeric}%`; });
}

document.addEventListener("click", (event) => {
  const monthButton = event.target.closest("[data-month-index]");
  if (monthButton) { setSelectedMonth(Number(monthButton.dataset.monthIndex)); closeOpenDialogs(); return; }
  const sequential = event.target.closest(".edge-month, .mobile-sequential-nav button");
  if (sequential) { setSelectedMonth(Math.min(11, Math.max(0, selectedMonthIndex + (sequential.matches(":first-child") ? -1 : 1)))); return; }
  const sceneButton = event.target.closest("[data-scene-button], [data-go-scene], [data-nav-scene]");
  if (sceneButton) {
    event.preventDefault();
    const scene = sceneButton.dataset.sceneButton || sceneButton.dataset.goScene || sceneButton.dataset.navScene;
    closeOpenDialogs();
    setScene(scene);
    return;
  }
  const editorButton = event.target.closest("[data-go-editor-state]");
  if (editorButton) { setEditorState(editorButton.dataset.goEditorState); setScene("editor"); return; }
  const dialogButton = event.target.closest("[data-open-dialog]");
  if (dialogButton) { openDialog(dialogButton.dataset.openDialog); return; }
  const closeButton = event.target.closest("[data-close-dialog]");
  if (closeButton) { closeButton.closest("dialog")?.close(); return; }
  const contextButton = event.target.closest("[data-context-kind]");
  if (contextButton) { configureContext(contextButton.dataset.contextKind, contextButton.dataset.contextMonth); return; }
  const actionButton = event.target.closest("[data-context-action]");
  if (actionButton) {
    const action = actionButton.dataset.contextAction;
    if (action === "delete") openDialog("deleteDialog");
    else if (["move", "swap", "assign", "reuse"].includes(action)) openDestination(action);
    else if (action === "edit") { closeOpenDialogs(); setEditorState("ready"); setScene("editor"); }
    else closeOpenDialogs();
    return;
  }
  const destination = event.target.closest("[data-destination-name]");
  if (destination) {
    const mode = destination.dataset.destinationMode;
    const occupied = destination.dataset.destinationOccupied === "true";
    if (mode === "swap") configureCommit("swap", destination.dataset.destinationName);
    else if (occupied && ["assign", "reuse"].includes(mode)) configureCommit("replace", destination.dataset.destinationName);
    else closeOpenDialogs();
    return;
  }
  const exportButton = event.target.closest("[data-export]");
  if (exportButton && !exportButton.disabled) {
    const value = exportButton.dataset.export;
    if (value.startsWith("png")) showPngSurface(value.endsWith("result") ? "result" : "progress", true);
    else openZip(value.replace("zip-", ""), true);
    return;
  }
  if (event.target.closest("[data-close-png]")) { document.querySelector("#pngSurface").hidden = true; return; }
  if (event.target.closest("[data-retry-save]")) { document.querySelector("#saveBanner").hidden = true; return; }
  if (event.target.closest("[data-toggle-save-detail]")) {
    const detail = document.querySelector(".save-detail");
    detail.hidden = !detail.hidden;
  }
});

document.querySelectorAll("[data-state-button]").forEach((button) => {
  button.addEventListener("click", () => applyState(button.dataset.stateButton));
});

document.querySelector("[data-toggle-prototype]").addEventListener("click", (event) => {
  const collapsed = prototypeBar.classList.toggle("is-collapsed");
  event.currentTarget.textContent = collapsed ? "Show controls" : "Hide controls";
  event.currentTarget.setAttribute("aria-expanded", String(!collapsed));
});

document.querySelector("#openSurface").addEventListener("click", () => openSurface(document.querySelector("#surfacePicker").value));
document.querySelectorAll("dialog").forEach((dialog) => dialog.addEventListener("click", (event) => { if (event.target === dialog && dialog.id !== "conflictDialog") dialog.close(); }));
document.querySelectorAll(".zoom-input").forEach((input) => input.addEventListener("input", () => setZoom(input.value)));
document.querySelectorAll("[data-reset-zoom]").forEach((button) => button.addEventListener("click", () => setZoom(100)));
document.querySelectorAll("[data-color]").forEach((button) => button.addEventListener("click", () => setBackground(button.dataset.color)));
document.querySelectorAll("[data-text-mode]").forEach((button) => button.addEventListener("click", () => { textColorMode = button.dataset.textMode; monthAppearance[selectedMonthIndex].textMode = textColorMode; syncCalendarText(); }));
document.querySelectorAll(".text-color-picker, .text-color-hex").forEach((input) => input.addEventListener("input", (event) => setCustomTextColor(event.target.value)));
document.querySelectorAll("[data-font-preset]").forEach((button) => button.addEventListener("click", () => setFontPreset(button.dataset.fontPreset)));
document.querySelectorAll("[data-font-scale]").forEach((button) => button.addEventListener("click", () => setFontScale(button.dataset.fontScale)));
document.querySelectorAll("#backgroundColor, #missingBackgroundColor, #sheetBackgroundColor").forEach((input) => input.addEventListener("input", () => setBackground(input.value)));
document.querySelectorAll("#backgroundHex, #missingBackgroundHex, #sheetBackgroundHex").forEach((input) => input.addEventListener("input", () => setBackground(input.value)));
[["backgroundR", "background"], ["backgroundG", "background"], ["backgroundB", "background"], ["missingBackgroundR", "missingBackground"], ["missingBackgroundG", "missingBackground"], ["missingBackgroundB", "missingBackground"], ["sheetBackgroundR", "sheetBackground"], ["sheetBackgroundG", "sheetBackground"], ["sheetBackgroundB", "sheetBackground"]].forEach(([id, prefix]) => {
  document.getElementById(id).addEventListener("input", () => setBackground(rgbToHex(prefix)));
});

renderMonthNavigation();
setFontPreset("editorial");
setFontScale("standard");
setSelectedMonth(0);
renderAssign("partial");
renderReview("incomplete");
setEntryState("first");
setEditorState("ready");
setBackground("#FFFFFF");
setScene("editor");
