const API_BASE = window.location.origin;
const AUTO_ACTIVITY_PING = false;
const INTERACTION_ACTIVITY_PING = true;
const ACTIVITY_THROTTLE_MS = 10000;

let sessionToken = null;
let sessionData = null;
let activityIntervalId = null;
let countdownIntervalId = null;
let lastActivityPingAt = 0;
let activityListenersAttached = false;

// Elementos del DOM
const initialView = document.getElementById("initialView");
const sessionView = document.getElementById("sessionView");
const qrIdInput = document.getElementById("qrIdInput");
const tableNumberEl = document.getElementById("tableNumber");
const countdownEl = document.getElementById("countdown");
const statusEl = document.getElementById("status");
const USER_ACTIVITY_EVENTS = ["click", "keydown", "touchstart", "scroll"];

async function handleOpenSession() {
  const qrId = qrIdInput.value;
  if (!qrId) {
    statusEl.textContent = "Por favor, ingresa el ID del QR.";
    return;
  }
  statusEl.textContent = "";

  try {
    await openSession(qrId);
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
  }
}

async function openSession(qrId) {
  const res = await fetch(API_BASE + "/t/" + qrId, {
    method: "GET",
    credentials: "include"
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "No se pudo abrir sesión");
  }

  const data = await res.json();

  sessionToken = data.token;
  sessionData = data.session;

  sessionStorage.setItem("table_session_token", sessionToken);
  sessionStorage.setItem("table_number", String(data.table.tableNumber));

  renderTable(data.table.tableNumber);
  startCountdown(sessionData.expiresAt);
  if (AUTO_ACTIVITY_PING) {
    startActivityPing();
  }
  if (INTERACTION_ACTIVITY_PING) {
    attachUserActivityTracking();
  }

  initialView.style.display = "none";
  sessionView.style.display = "block";
}

async function touchSession() {
  if (!sessionToken) return;

  const res = await fetch(API_BASE + "/t/session/activity", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + sessionToken
    },
    credentials: "include"
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.warn("No se pudo renovar actividad:", err.message || res.status);
    return;
  }

  const data = await res.json();
  sessionData = data.session;
}

async function closeByPayment() {
  if (!sessionToken) return;

  try {
    const res = await fetch(API_BASE + "/t/session/pay", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + sessionToken
      },
      credentials: "include"
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "No se pudo cerrar por pago");
    }

    stopTimers();
    sessionToken = null;
    sessionData = null;
    sessionStorage.removeItem("table_session_token");
    sessionStorage.removeItem("table_number");

    initialView.style.display = "block";
    sessionView.style.display = "none";
    statusEl.textContent = "Sesión cerrada por pago.";

  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
  }
}

function startActivityPing() {
  stopActivityPing();
  activityIntervalId = setInterval(() => {
    touchSession().catch(console.error);
  }, 25000);
}

function onUserInteraction() {
  if (!sessionToken || !INTERACTION_ACTIVITY_PING) return;

  const now = Date.now();
  if (now - lastActivityPingAt < ACTIVITY_THROTTLE_MS) {
    return;
  }

  lastActivityPingAt = now;
  touchSession().catch(console.error);
}

function attachUserActivityTracking() {
  if (activityListenersAttached) return;

  USER_ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, onUserInteraction, { passive: true });
  });

  activityListenersAttached = true;
}

function detachUserActivityTracking() {
  if (!activityListenersAttached) return;

  USER_ACTIVITY_EVENTS.forEach((eventName) => {
    window.removeEventListener(eventName, onUserInteraction);
  });

  activityListenersAttached = false;
}

function stopActivityPing() {
  if (activityIntervalId) clearInterval(activityIntervalId);
  activityIntervalId = null;
}

function startCountdown(expiresAtIso) {
  stopCountdown();

  countdownIntervalId = setInterval(() => {
    const now = Date.now();
    const end = new Date(sessionData.expiresAt || expiresAtIso).getTime();
    const diff = Math.max(0, end - now);

    const min = Math.floor(diff / 60000);
    const sec = Math.floor((diff % 60000) / 1000);

    renderTime(min, sec);

    if (diff === 0) {
      stopTimers();
      renderExpired();
    }
  }, 1000);
}

function stopCountdown() {
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  countdownIntervalId = null;
}

function stopTimers() {
  stopActivityPing();
  detachUserActivityTracking();
  stopCountdown();
}

function renderTable(tableNumber) {
  tableNumberEl.textContent = tableNumber;
}

function renderTime(min, sec) {
  countdownEl.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function renderExpired() {
  statusEl.textContent = "La sesión ha expirado.";
  sessionView.style.display = "none";
  initialView.style.display = "block";
  qrIdInput.value = "";
}
