(() => {
  const SAVE_INTERVAL_MS = 10000;
  const EDIT_AUTOSAVE_ENDPOINT = "AutoSaveEdit.php";
  const AUTOSAVE_COOKIE_PREFIXES = ["autoguardado_nota_", "autoguardado_puntero_nota_", "autoguardado_nueva_nota"];
  const EDITOR_ID = "editor";

  function getTitleInput() {
    return document.querySelector('input[name="title"]');
  }

  function getNoteIdInput() {
    return document.querySelector('input[name="note_id"]');
  }

  function getEditorInstance() {
    return window.tinymce ? window.tinymce.get(EDITOR_ID) : null;
  }

  function getEditorContent() {
    const editor = getEditorInstance();
    if (editor) {
      return editor.getContent();
    }

    const textarea = document.getElementById(EDITOR_ID);
    return textarea ? textarea.value : "";
  }

  function setEditorContent(content) {
    const editor = getEditorInstance();
    if (editor) {
      editor.setContent(content || "");
      return;
    }

    const textarea = document.getElementById(EDITOR_ID);
    if (textarea) {
      textarea.value = content || "";
    }
  }

  function encodeCookieName(name) {
    return encodeURIComponent(name);
  }

  function clearCookieByName(name) {
    document.cookie = `${encodeCookieName(name)}=; max-age=0; path=/`;
  }

  function clearLegacyAutosaveCookies() {
    const cookies = document.cookie ? document.cookie.split("; ") : [];

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      if (eqPos === -1) {
        continue;
      }

      const rawName = cookie.slice(0, eqPos);
      let decodedName = rawName;
      try {
        decodedName = decodeURIComponent(rawName);
      } catch (error) {
        decodedName = rawName;
      }

      if (AUTOSAVE_COOKIE_PREFIXES.some((prefix) => decodedName.startsWith(prefix))) {
        clearCookieByName(decodedName);
      }
    }
  }

  function waitForEditor(callback) {
    const editor = getEditorInstance();
    if (editor) {
      callback(editor);
      return;
    }

    window.setTimeout(() => waitForEditor(callback), 100);
  }

  function onEditorReady(callback) {
    waitForEditor((editor) => {
      const start = () => callback(editor);

      if (editor.initialized) {
        start();
        return;
      }

      editor.on("init", start);
    });
  }

  function initNewNoteAutosave() {
    onEditorReady(() => {
      clearLegacyAutosaveCookies();
      if (window.message) {
        if (typeof window.message.info === "function") {
          window.message.info("Para autoguardado debes guardar primero el documento");
        } else if (typeof window.message.tip === "function") {
          window.message.tip("Para autoguardado debes guardar primero el documento");
        }
      }
    });
  }

  function initEditNoteAutosave() {
    const titleInput = getTitleInput();
    const noteIdInput = getNoteIdInput();
    const noteId = noteIdInput ? noteIdInput.value.trim() : "";

    if (!noteId) {
      return;
    }

    let lastPayloadSignature = "";

    async function saveEditNoteDraft() {
      const title = titleInput ? titleInput.value.trim() : "";
      const content = getEditorContent();
      const payloadSignature = `${title}\u0000${content}`;

      console.log("[autoguardado][nota editada->db]", {
        noteId,
        title,
        content,
      });

      if (payloadSignature === lastPayloadSignature) {
        return;
      }

      if (!title || !content) {
        return;
      }

      try {
        const body = new URLSearchParams();
        body.set("note_id", noteId);
        body.set("title", title);
        body.set("content", content);

        const response = await fetch(EDIT_AUTOSAVE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: body.toString(),
          credentials: "same-origin",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (data && data.success) {
          lastPayloadSignature = payloadSignature;
          if (window.message && typeof window.message.success === "function") {
            window.message.success("Autoguardado con éxito");
          }
        }
      } catch (error) {
        console.error("[autoguardado][nota editada->db][error]", error);
      }
    }

    onEditorReady(() => {
      clearLegacyAutosaveCookies();
      saveEditNoteDraft();
      window.setInterval(saveEditNoteDraft, SAVE_INTERVAL_MS);
      window.addEventListener("beforeunload", saveEditNoteDraft);

      if (titleInput) {
        titleInput.addEventListener("input", saveEditNoteDraft);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (getNoteIdInput()) {
      initEditNoteAutosave();
      return;
    }

    initNewNoteAutosave();
  });
})();