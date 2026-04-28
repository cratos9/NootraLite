tinymce.init({
  selector: "#editor",
  height: 485,

  license_key: "gpl",

  skin: "oxide-dark",
  content_css: "/nootralite/css/Notes/Editor.css",
  body_class: "note-editor-content",
  setup: (editor) => {
    const syncEditorTheme = () => {
      const editorBody = editor.getBody();

      if (!editorBody) {
        return;
      }

      const isLightMode = document.body.classList.contains("light-mode");
      editorBody.classList.toggle("note-editor-light", isLightMode);
      editorBody.classList.toggle("note-editor-dark", !isLightMode);
    };

    editor.on("init", () => {
      syncEditorTheme();

      const observer = new MutationObserver(syncEditorTheme);
      observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
      editor.on("remove", () => observer.disconnect());
    });
  },

  plugins: `
    advlist autolink lists link image charmap preview anchor
    searchreplace visualblocks code fullscreen
    insertdatetime media table code help wordcount
  `,

  toolbar: `
    undo redo |
    blocks fontfamily fontsize |
    bold italic underline strikethrough |
    forecolor backcolor |
    alignleft aligncenter alignright alignjustify |
    bullist numlist outdent indent |
    link  |
    table |
    searchreplace |
    code fullscreen |
    preview |
    removeformat |
    help
  `,

  menubar: "file edit view insert format tools table help",

  toolbar_sticky: true,

  image_title: true,
  automatic_uploads: true,

  file_picker_types: "image",
});
