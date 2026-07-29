const SUPABASE_URL = "https://kfialbtzdlpjedzqccon.supabase.co";
const SUPABASE_KEY =
  "sb_publishable_9363s4ZytqzxkArkpp_c2Q_ASh3btSg";

const BUCKET_NAME = "uploads";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const progressBar = document.getElementById("progressBar");
const statusText = document.getElementById("status");
const uploadArea = document.querySelector(".upload-area");

let selectedFiles = [];

fileInput.addEventListener("change", () => {
  selectedFiles = Array.from(fileInput.files || []);
  showSelectedFiles();
});

function showSelectedFiles() {
  progressBar.style.width = "0%";

  if (selectedFiles.length === 0) {
    statusText.textContent = "";
    return;
  }

  const totalSize = selectedFiles.reduce(
    (total, file) => total + file.size,
    0
  );

  statusText.innerHTML =
    `<strong>${selectedFiles.length} dosya seçildi.</strong><br>` +
    `<span>${formatBytes(totalSize)}</span>`;
}

uploadBtn.addEventListener("click", uploadFiles);

async function uploadFiles() {
  if (selectedFiles.length === 0) {
    alert("Lütfen önce fotoğraf veya video seçin.");
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Yükleniyor...";
  progressBar.style.width = "0%";

  let uploadedCount = 0;
  const failedFiles = [];

  for (let index = 0; index < selectedFiles.length; index++) {
    const file = selectedFiles[index];

    statusText.innerHTML =
      `<strong>${index + 1} / ${selectedFiles.length}</strong><br>` +
      `${escapeHtml(file.name)} yükleniyor...`;

    try {
      const filePath = createUniqueFilePath(file);

      const { error } = await supabaseClient.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type || "application/octet-stream",
          upsert: false
        });

      if (error) {
        throw error;
      }

      uploadedCount++;
    } catch (error) {
      console.error("Yükleme hatası:", file.name, error);
      failedFiles.push({
        name: file.name,
        message: error?.message || "Bilinmeyen hata"
      });
    }

    const percentage = Math.round(
      ((index + 1) / selectedFiles.length) * 100
    );

    progressBar.style.width = `${percentage}%`;
  }

  uploadBtn.disabled = false;
  uploadBtn.textContent = "Yüklemeyi Başlat";

  if (failedFiles.length === 0) {
    statusText.innerHTML =
      "❤️ <strong>Fotoğraf ve videolarınız başarıyla yüklendi.</strong>" +
      "<br><br>" +
      "Mutluluğumuza ortak olduğunuz için teşekkür ederiz." +
      "<br>" +
      "<strong>Ece & Ata</strong>";

    selectedFiles = [];
    fileInput.value = "";
    return;
  }

  statusText.innerHTML =
    `<strong>${uploadedCount} dosya başarıyla yüklendi.</strong><br>` +
    `<span>${failedFiles.length} dosya yüklenemedi.</span><br><br>` +
    failedFiles
      .map(
        item =>
          `${escapeHtml(item.name)}: ${escapeHtml(item.message)}`
      )
      .join("<br>");
}

function createUniqueFilePath(file) {
  const now = new Date();

  const dateFolder = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  const randomId =
    window.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const safeName = sanitizeFileName(file.name);

  return `${dateFolder}/${randomId}-${safeName}`;
}

function sanitizeFileName(fileName) {
  const normalizedName = fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalizedName
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 KB";

  const units = ["Bytes", "KB", "MB", "GB"];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);

  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = String(value);
  return element.innerHTML;
}

/* Masaüstünde sürükle-bırak desteği */

["dragenter", "dragover"].forEach(eventName => {
  uploadArea.addEventListener(eventName, event => {
    event.preventDefault();
    uploadArea.classList.add("drag-active");
  });
});

["dragleave", "drop"].forEach(eventName => {
  uploadArea.addEventListener(eventName, event => {
    event.preventDefault();
    uploadArea.classList.remove("drag-active");
  });
});

uploadArea.addEventListener("drop", event => {
  const droppedFiles = Array.from(event.dataTransfer.files || []).filter(
    file =>
      file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      /\.(heic|heif|mov)$/i.test(file.name)
  );

  if (droppedFiles.length === 0) {
    alert("Lütfen fotoğraf veya video dosyası seçin.");
    return;
  }

  selectedFiles = droppedFiles;
  showSelectedFiles();
});
