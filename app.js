const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const progressBar = document.getElementById("progressBar");
const status = document.getElementById("status");

let files = [];

fileInput.addEventListener("change", (e) => {
    files = [...e.target.files];

    if (files.length === 0) {
        status.textContent = "";
        return;
    }

    status.textContent = `${files.length} dosya seçildi.`;
});

uploadBtn.addEventListener("click", async () => {

    if (files.length === 0) {
        alert("Lütfen önce fotoğraf veya video seçin.");
        return;
    }

    progressBar.style.width = "0%";

    for (let i = 0; i <= 100; i++) {

        await new Promise(resolve => setTimeout(resolve, 20));

        progressBar.style.width = i + "%";

    }

    status.innerHTML =
    "❤️ Fotoğraf ve videolarınız başarıyla yüklendi.<br><br>Mutluluğumuza ortak olduğunuz için teşekkür ederiz.";

});
