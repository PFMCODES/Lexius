export default class NotificationSystem {
    constructor() {
        this.window = document.querySelector(".codeWindow");
        this.body = document.getElementById("N-body");
        this.title = document.getElementById("N-Title");
        this.logo = document.getElementById("N-logo");
        this.thumbnail = document.getElementById("N-thumbnail");
        this.close = document.querySelector("#N-X")
        if (this.close) {
            this.close.addEventListener("click", () => {
                document.querySelector('.codeWindow').style.display = 'none';
                if (this.onClose) this.onClose();
            });
        }
    }
    new({
        title,
        content,
        logo,
        thumbnail,
        onClose
    }) {
        console.log("Notification .new() called", this.window);
        this.window.style.display = "flex";
        this.body.innerHTML = content;;
        this.logo.src = logo ? logo : "/assets/images/favicon.svg";
        this.title.textContent = title;
        if (thumbnail) {
            this.thumbnail.src = thumbnail;
        }
        this.onClose = onClose;
        console.log({this: this}, { title, content, logo, thumbnail, onClose }, this.window.style.display)
    }
    onClose() {
        return;
    }
    destroy() {
        this.close.removeEventListener("click", this.onClose);
    }
}