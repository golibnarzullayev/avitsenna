tinymce.init({
  selector: "textarea.tinymce-editor",
  height: 500,
  width: "100%",
  menubar: true,
  plugins:
    "preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount charmap quickbars emoticons media mediaembed",
  content_style:
    "img { width: 100%; height: auto; object-fit: cover }, body { font-size:14px }",
  paste_data_images: true,
  powerpaste_allow_local_images: true,
  automatic_uploads: true,
  file_picker_types: "image",
  file_browser_callback_types: "image",
  file_picker_callback: function (cb, value, meta) {
    var input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.onchange = function () {
      var file = this.files[0];

      var reader = new FileReader();
      reader.onload = function () {
        var id = "blobid" + new Date().getTime();
        var blobCache = tinymce.activeEditor.editorUpload.blobCache;
        var base64 = reader.result.split(",")[1];
        var blobInfo = blobCache.create(id, file, base64);
        blobCache.add(blobInfo);
        cb(blobInfo.blobUri(), { title: file.name });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  },
  media_url_resolver: function (data, resolve) {
    if (data.url.indexOf("youtube") !== -1) {
      data.url = data.url.replace("watch?v=", "embed/");
      var embedHtml = `<iframe src="${data.url}" frameborder="0"></iframe>`;
      resolve({ html: embedHtml });
    } else {
      resolve({ html: "" });
    }
  },
  lineheight_formats:
    "8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 26pt 36pt",
  toolbar: `undo redo |
      bold italic underline strikethrough backcolor forecolor removeformat lineheightselect |
      insertfile image media link codesample | numlist bullist | 
      print fullscreen  preview | fontfamily fontsize blocks |
      alignleft aligncenter alignright alignjustify`,
  importcss_append: true,
  image_caption: true,
});
