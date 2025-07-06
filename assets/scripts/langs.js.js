import { monaco } from './monaco.js';

function DetectFileType(f) {
    f = f.toLowerCase();

    if (f.endsWith(".js")) return "javascript";
    if (f.endsWith(".ts")) return "typescript";
    if (f.endsWith(".jsx")) return "javascript";
    if (f.endsWith(".tsx")) return "typescript";
    if (f.endsWith(".json")) return "json";
    if (f.endsWith(".html")) return "html";
    if (f.endsWith(".css")) return "css";
    if (f.endsWith(".scss")) return "scss";
    if (f.endsWith(".less")) return "less";
    if (f.endsWith(".md")) return "markdown";
    if (f.endsWith(".mdx")) return "mdx";
    if (f.endsWith(".vue")) return "vue";
    if (f.endsWith(".svelte")) return "svelte";
    if (f.endsWith(".php")) return "php";
    if (f.endsWith(".py")) return "python";
    if (f.endsWith(".java")) return "java";
    if (f.endsWith(".c")) return "c";
    if (f.endsWith(".cpp") || f.endsWith(".cxx") || f.endsWith(".cc")) return "cpp";
    if (f.endsWith(".h")) return "c-header";
    if (f.endsWith(".hpp") || f.endsWith(".hxx") || f.endsWith(".hh")) return "cpp-header";
    if (f.endsWith(".go")) return "go";
    if (f.endsWith(".rb")) return "ruby";
    if (f.endsWith(".swift")) return "swift";
    if (f.endsWith(".kt") || f.endsWith(".kotlin")) return "kotlin";
    if (f.endsWith(".rs")) return "rust";
    if (f.endsWith(".lua")) return "lua";
    if (f.endsWith(".sh") || f.endsWith(".bash")) return "bash";
    if (f.endsWith(".sql")) return "sql";
    if (f.endsWith(".yaml") || f.endsWith(".yml")) return "yaml";
    if (f.endsWith(".xml")) return "xml";
    if (f.endsWith(".txt")) return "plaintext";
    if (f.endsWith(".svg")) return "svg";
    if (f.endsWith(".tsv")) return "tsv";
    if (f.endsWith(".csv")) return "csv";
    if (f.endsWith(".wasm")) return "wasm";
    if (f.endsWith(".jsonc")) return "jsonc";
    if (f.endsWith(".json5")) return "json5";
    if (f.endsWith(".diff") || f.endsWith(".patch")) return "diff";
    if (f.endsWith(".asm") || f.endsWith(".s")) return "assembly";
    if (f.endsWith(".m")) return "objective-c";
    if (f.endsWith(".mm")) return "objective-cpp";
    if (f.endsWith(".dart")) return "dart";
    if (f.endsWith(".scala")) return "scala";
    if (f.endsWith(".clj") || f.endsWith(".cljs") || f.endsWith(".cljc")) return "clojure";
    if (f.endsWith(".elixir")) return "elixir";
    if (f.endsWith(".erl") || f.endsWith(".hrl")) return "erlang";
    if (f.endsWith(".groovy")) return "groovy";
    if (f.endsWith(".hbs") || f.endsWith(".handlebars")) return "handlebars";
    if (f.endsWith(".jinja") || f.endsWith(".j2")) return "jinja";
    if (f.endsWith(".tex")) return "latex";
    if (f.endsWith(".r") || f.endsWith(".rmd")) return "r";
    if (f.endsWith(".pl") || f.endsWith(".pm")) return "perl";
    if (f.endsWith(".cs")) return "csharp";
    if (f.endsWith(".fs")) return "fsharp";
    if (f.endsWith(".vb")) return "visual-basic";
    if (f.endsWith(".nim")) return "nim";
    if (f.endsWith(".hcl")) return "hcl";
    if (f.endsWith(".toml")) return "toml";
    if (f.endsWith(".zig")) return "zig";
    if (f.endsWith(".v")) return "vlang";
    if (f.endsWith(".cshtml") || f.endsWith(".razor")) return "razor";

    return "unknown";
}

function returnFileIcon(f) {
    const type = DetectFileType(f);
    const base = "../../assets/images/";
    const map = {
        javascript: "js.svg",
        typescript: "ts.svg",
        react: "jsx.svg",
        json: "json.svg",
        html: "html.svg",
        css: "css.svg",
        scss: "scss.svg",
        less: "less.svg",
        markdown: "markdown.svg",
        mdx: "mdx.svg",
        vue: "vue.svg",
        svelte: "svelte.svg",
        php: "php.svg",
        python: "python.svg",
        java: "java.svg",
        c: "c.svg",
        cpp: "cpp.svg",
        go: "go.svg",
        ruby: "ruby.svg",
        swift: "swift.svg",
        kotlin: "kotlin.svg",
        rust: "rust.svg",
        lua: "lua.svg",
        bash: "bash.svg",
        sql: "sql.svg",
        yaml: "yaml.svg",
        xml: "xml.svg",
        plaintext: "file.svg",
        svg: "svg.svg",
        tsv: "tsv.svg",
        csv: "csv.svg",
        wasm: "wasm.svg",
        jsonc: "jsonc.svg",
        json5: "json5.svg",
        diff: "diff.svg",
        assembly: "assembly.svg",
        "c-header": "h.svg",
        "cpp-header": "hpp.svg",
        "objective-c": "m.svg",
        "objective-cpp": "mpp.svg",
        dart: "dart.svg",
        scala: "scala.svg",
        clojure: "clojure.svg",
        elixir: "elixir.svg",
        erlang: "erlang.svg",
        groovy: "groovy.svg",
        handlebars: "handlebars.svg",
        jinja: "jinja.svg",
        latex: "latex.svg",
        r: "r.svg",
        perl: "perl.svg",
        csharp: "csharp.svg",
        fsharp: "fsharp.svg",
        "visual-basic": "vb.svg",
        nim: "nim.svg",
        hcl: "hcl.svg",
        toml: "toml.svg",
        zig: "zig.svg",
        vlang: "vlang.svg",
        razor: "razor.svg"
    };

    return base + (map[type] || "file.svg");
}

const filesContainer = document.getElementsByClassName("files")[0];
const filesTab = document.getElementsByClassName('files-tab')[0];

document.addEventListener("DOMContentLoaded", () => {
    if (!filesContainer) return;
    filesTab.setAttribute('data-status', "open")

    const fileElements = filesContainer.getElementsByClassName("file");

    for (let i = 0; i < fileElements.length; i++) {
        const file = fileElements[i];
        const fileNameEl = file.getElementsByClassName("fileName")[0];
        const iconImg = file.getElementsByClassName("fileIcon")[0]?.getElementsByTagName("img")[0];

        if (fileNameEl && iconImg) {
            const fileName = fileNameEl.textContent.trim();
            const iconUrl = returnFileIcon(fileName);

            iconImg.src = iconUrl;
            iconImg.alt = `Icon for ${fileName}`;

            console.log(`Set icon for ${fileName}: ${iconUrl}`);
        }
    }
});

document.getElementById('closeBtn').addEventListener('click', () => {
  if (!filesTab) return;
  const filesTabStatus = filesTab.getAttribute('data-status');

  if (filesTabStatus == "open") {
    filesTab.setAttribute('data-status', 'close');
    filesTab.style.display = "none";
  } else {
    filesTab.style.display = 'block';

    // Wait for DOM reflow before updating status and layout
    requestAnimationFrame(() => {
      filesTab.setAttribute('data-status', 'open');
      document.getElementById('editor').innerHTML = ''
      filesTab.style.display = 'flex';
        const el = document.getElementsByClassName('selected')[0].innerText
      const lang = DetectFileType(el)
      monaco(lang, localStorage.getItem(el))
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const selectedFile = document.getElementsByClassName('selected')[0];
    const fileName = selectedFile.textContent.trim();
    const lang = DetectFileType(fileName);
    const code = localStorage.getItem(fileName) || 'console.log("Hello, World!");';
    monaco(lang, code);
});

function autoSave() {
  const isAutoSaveEnabled = localStorage.getItem("autosave") === "true";
  if (!isAutoSaveEnabled) return;

  const selectedEl = document.getElementsByClassName('selected')[0];
  if (!selectedEl || !window.editorInstance) return;

  const fileName = selectedEl.innerText.trim();
  const value = window.editorInstance.getValue();

  if (value !== localStorage.getItem(fileName)) {
    localStorage.setItem(fileName, value);
    console.log(`Auto-saved ${fileName}`);
  }
}

setInterval(autoSave, 2000)

document.querySelectorAll('.true').forEach((o) => {
    o.innerHTML = '<i class="codicon codicon-check"></i>'
})

document.getElementById('File').addEventListener('click', () => {
    document.querySelector('.fileBtnOptions').classList.toggle('active');
});

document.querySelector('.fileBtnOptions').addEventListener('mouseleave', () => {
    document.querySelector('.fileBtnOptions').classList.remove('active');
});

document.getElementById('autosave').addEventListener('click', () => {
    const checkEl = document.getElementById('autosave-check');
    const current = localStorage.getItem('autosave') === 'true';

    localStorage.setItem('autosave', (!current).toString());

    if (current) {
        checkEl.classList.remove('true');
    } else {
        checkEl.classList.add('true');
    }
});

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('autosave') === 'true') {
        document.getElementById('autosave-check').classList.add('true');
    }
    if (!localStorage.getItem('autosave')) {
        localStorage.setItem('autosave', 'true')
    }
});