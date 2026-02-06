/* =========================================================
   Wiki Kreative - Feedback UI (Toast + Validación + Anti-doble envío)
   - No depende de librerías
   - Reutilizable: WKFeedback.toast / validateRequired / withButtonLock
   - Sobrescribe showError/showSuccess para no tocar todo el proyecto
   ========================================================= */

(() => {
  "use strict";

  const STACK_ID = "wkToastStack";

  function ensureStack() {
    let stack = document.getElementById(STACK_ID);
    if (!stack) {
      stack = document.createElement("div");
      stack.id = STACK_ID;
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    return stack;
  }

  function normalizeText(v) {
    return String(v ?? "").trim();
  }

  function toast({ type = "info", title = "Info", message = "", duration = 3200 } = {}) {
    const stack = ensureStack();

    const t = document.createElement("div");
    t.className = `toast ${type}`;

    const iconMap = {
      success: "✅",
      error: "⛔",
      warn: "⚠️",
      info: "ℹ️",
    };

    t.innerHTML = `
      <div class="icon" aria-hidden="true">${iconMap[type] || "ℹ️"}</div>
      <div class="content">
        <p class="title">${normalizeText(title) || "Info"}</p>
        <p class="msg">${normalizeText(message)}</p>
      </div>
      <button class="close" type="button" aria-label="Cerrar">×</button>
    `;

    const closeBtn = t.querySelector(".close");
    closeBtn.addEventListener("click", () => removeToast(t));

    stack.appendChild(t);
    // animación
    requestAnimationFrame(() => t.classList.add("show"));

    if (duration && duration > 0) {
      window.setTimeout(() => removeToast(t), duration);
    }

    return t;
  }

  function removeToast(node) {
    if (!node) return;
    node.classList.remove("show");
    window.setTimeout(() => node.remove(), 180);
  }

  function setBusy(btn, busy, loadingText = "Guardando...") {
    if (!btn) return;

    if (busy) {
      btn.dataset.busy = "1";
      btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
      btn.disabled = true;
      btn.style.opacity = "0.85";
      btn.style.cursor = "not-allowed";
      btn.textContent = loadingText;
    } else {
      btn.dataset.busy = "0";
      btn.disabled = false;
      btn.style.opacity = "";
      btn.style.cursor = "";
      if (btn.dataset.originalText) btn.textContent = btn.dataset.originalText;
    }
  }

  async function withButtonLock(btn, fn, { loadingText = "Guardando..." } = {}) {
    if (!btn) return await fn();

    if (btn.dataset.busy === "1") return; // anti doble click

    setBusy(btn, true, loadingText);
    try {
      return await fn();
    } finally {
      setBusy(btn, false);
    }
  }

  function markInvalid(el) {
    if (!el) return;
    el.classList.add("is-invalid");

    // auto-limpiar al corregir
    const clear = () => el.classList.remove("is-invalid");
    el.addEventListener("input", clear, { once: true });
    el.addEventListener("change", clear, { once: true });
  }

  /**
   * fields: [{ id: "uploadTitle", label: "Título" }, ...]
   * - Valida vacío
   * - Marca inválidos con .is-invalid
   * - Enfoca el primero inválido y lanza toast
   */
  function validateRequired(fields = []) {
    let firstInvalid = null;
    const missingLabels = [];

    fields.forEach(({ id, label }) => {
      const el = document.getElementById(id);
      const value = normalizeText(el?.value);

      const isMissing =
        !el ||
        value === "" ||
        (el.tagName === "SELECT" && value === "");

      if (isMissing) {
        markInvalid(el);
        if (!firstInvalid && el) firstInvalid = el;
        missingLabels.push(label || id);
      }
    });

    if (missingLabels.length > 0) {
      toast({
        type: "warn",
        title: "Faltan campos",
        message: `Completa: ${missingLabels.join(", ")}.`,
        duration: 3800,
      });

      if (firstInvalid) {
        firstInvalid.focus({ preventScroll: false });
      }
      return false;
    }

    return true;
  }

  // API pública
  window.WKFeedback = {
    toast,
    withButtonLock,
    validateRequired,
    markInvalid,
  };

  // Compatibilidad con tu código actual:
  // index.js ya usa showError/showSuccess, así no repetimos cambios por todo el archivo.
  window.showError = (msg) =>
    toast({ type: "error", title: "Error", message: normalizeText(msg) || "Ocurrió un error." });

  window.showSuccess = (msg) =>
    toast({ type: "success", title: "Listo", message: normalizeText(msg) || "Acción realizada." });

})();
