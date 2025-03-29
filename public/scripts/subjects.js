const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dlcujlif7/upload";
const CLOUDINARY_UPLOAD_PRESET = "personal_space";

// Set subject name dynamically from URL
window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get("name") || "Subject";

    const subjectTitle = document.getElementById("subjectName");
    if (subjectTitle) {
        subjectTitle.innerText = subject;
    } else {
        console.error("Element with ID 'subjectName' not found.");
        return;
    }

    loadFiles(subject);
};

// Upload File to Cloudinary
async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput || !fileInput.files.length) {
        alert("Please select a file.");
        return;
    }

    const file = fileInput.files[0];
    const subject = document.getElementById("subjectName").innerText;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", `subjects/${subject}`);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();

        if (data.secure_url) {
            saveFile(subject, file.name, data.secure_url);
            displayFile(subject, file.name, data.secure_url);
        }
    } catch (error) {
        console.error("File upload failed:", error);
        alert("Upload failed.");
    }
}

// Save uploaded file details to local storage
function saveFile(subject, name, url) {
    let files = JSON.parse(localStorage.getItem(`files_${subject}`)) || [];
    files.push({ name, url });
    localStorage.setItem(`files_${subject}`, JSON.stringify(files));
}

// Load and display files from local storage
function loadFiles(subject) {
    const fileList = document.getElementById("fileList");
    if (!fileList) {
        console.error("Element with ID 'fileList' not found.");
        return;
    }

    fileList.innerHTML = ""; // Clear the file list

    const files = JSON.parse(localStorage.getItem(`files_${subject}`)) || [];
    if (files.length === 0) {
        fileList.innerHTML = "<p>No files uploaded yet.</p>";
        return;
    }

    files.forEach(({ name, url }) => displayFile(subject, name, url));
}

// Display a single uploaded file
function displayFile(subject, name, url) {
    const fileList = document.getElementById("fileList");
    if (!fileList) return;

    const div = document.createElement("div");
    div.classList.add("uploaded-file");

    const link = document.createElement("a");
    link.href = url;
    link.innerText = name;
    link.target = "_blank";

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "X";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => removeFile(subject, name, div);

    div.appendChild(link);
    div.appendChild(deleteBtn);
    fileList.appendChild(div);
}

// Remove file from local storage and UI
function removeFile(subject, name, element) {
    let files = JSON.parse(localStorage.getItem(`files_${subject}`)) || [];
    files = files.filter(file => file.name !== name);
    localStorage.setItem(`files_${subject}`, JSON.stringify(files));

    // Remove file element from UI
    if (element) {
        element.remove();
    }
}
