// Cloudinary Configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dlcujlif7/upload";
const CLOUDINARY_UPLOAD_PRESET = "personal_space";

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
}

if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-mode");
}

// Upload to Cloudinary
async function uploadToCloudinary(file, isText = false) {
    const formData = new FormData();
    if (isText) {
        const blob = new Blob([file], { type: "text/plain" });
        formData.append("file", blob, "note.txt");
        formData.append("resource_type", "raw");
    } else {
        formData.append("file", file);
    }
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Upload Failed:", error);
        return null;
    }
}

// Handle Image Upload (Paste & Drag-Drop)
document.addEventListener("paste", async function (event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const item of items) {
        if (item.type.startsWith("image")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
                await uploadAndStoreImage(file);
                break; // Ensure only one image is uploaded
            }
        }
    }
});

// Drag-and-Drop Support
function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) uploadAndStoreImage(file);
}

function allowDrop(event) {
    event.preventDefault();
}

// Upload Image to Cloudinary and Save URL
async function uploadAndStoreImage(file) {
    const imageUrl = await uploadToCloudinary(file);
    if (imageUrl) {
        saveImageUrl(imageUrl);
        displayUploadedFile(imageUrl);
    }
}

// Store Image URLs in Local Storage
function saveImageUrl(url) {
    let images = JSON.parse(localStorage.getItem("savedImages")) || [];
    images.push(url);
    localStorage.setItem("savedImages", JSON.stringify(images));
}

// Load Images from Local Storage on Page Load
function loadSavedImages() {
    const images = JSON.parse(localStorage.getItem("savedImages")) || [];
    document.getElementById("imagePreview").innerHTML = ""; // Clear previous images
    images.forEach(displayUploadedFile);
}

// Display Image
function displayUploadedFile(url) {
    const div = document.createElement("div");
    div.classList.add("image-controls");

    const img = document.createElement("img");
    img.src = url;
    img.classList.add("uploaded-image");
    img.onclick = () => viewFullscreen(url);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "X";
    deleteBtn.classList.add("delete-image-btn");
    deleteBtn.onclick = () => {
        div.remove();
        removeImageFromStorage(url);
    };

    div.appendChild(img);
    div.appendChild(deleteBtn);
    document.getElementById("imagePreview").appendChild(div);
}

// Remove Image from Local Storage
function removeImageFromStorage(url) {
    let images = JSON.parse(localStorage.getItem("savedImages")) || [];
    images = images.filter(image => image !== url);
    localStorage.setItem("savedImages", JSON.stringify(images));
}

// Load Images on Page Load
window.onload = function () {
    loadNotes();  // Load saved notes
    loadSavedImages();  // Load saved images
};

// Save Notes to Cloudinary and Store URL in Local Storage
async function saveNote(textarea, key) {
    const noteText = textarea.value.trim();
    if (!noteText) return;

    const blob = new Blob([noteText], { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", blob, `${key}.txt`);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();

        if (data.secure_url) {
            localStorage.setItem(`${key}_url`, data.secure_url); // Store URL in localStorage
            console.log(`Note saved at: ${data.secure_url}`);
        }
    } catch (error) {
        console.error("Note upload failed:", error);
    }
}

// Load Notes from Cloudinary (Using Saved URL)
async function loadNotes() {
    document.querySelectorAll(".image-notes").forEach(async (textarea) => {
        const key = textarea.previousElementSibling.innerText.trim();
        const savedUrl = localStorage.getItem(`${key}_url`);

        if (savedUrl) {
            try {
                const noteResponse = await fetch(savedUrl);
                textarea.value = await noteResponse.text();
            } catch (error) {
                console.error(`Failed to fetch ${key} note from Cloudinary`, error);
            }
        }
    });

    // Load General Notes
    const generalNotesUrl = localStorage.getItem("GeneralNotes_url");
    if (generalNotesUrl) {
        try {
            const noteResponse = await fetch(generalNotesUrl);
            document.getElementById("generalNotes").value = await noteResponse.text();
        } catch (error) {
            console.error("Failed to fetch General Notes from Cloudinary", error);
        }
    }
}

// Save General Notes Immediately on Change
document.getElementById("generalNotes").addEventListener("input", async function () {
    const text = this.value.trim();
    if (!text) return;

    const blob = new Blob([text], { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", blob, "GeneralNotes.txt");
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();

        if (data.secure_url) {
            localStorage.setItem("GeneralNotes_url", data.secure_url);
            console.log(`General Notes saved at: ${data.secure_url}`);
        }
    } catch (error) {
        console.error("General Notes upload failed:", error);
    }
});

// Load Notes on Page Load
window.onload = function () {
    loadNotes();  // Load saved notes
    loadSavedImages();  // Load saved images
};
/// Function to Save General Notes as a Word File and Upload to Cloudinary
async function saveGeneralNotesAsWord() {
    if (!window.docx) {
        console.error("docx library not loaded.");
        alert("Error: docx library is missing!");
        return;
    }

    const text = document.getElementById("generalNotes").value.trim();
    if (!text) {
        alert("Please enter some notes before saving.");
        return;
    }

    const fileName = prompt("Enter file name:", "General_Notes");
    if (!fileName) return;

    // Create Word document
    const doc = new docx.Document({
        sections: [
            {
                children: [
                    new docx.Paragraph({
                        text: text,
                        spacing: { after: 200 }, // Space after paragraph
                    }),
                ],
            },
        ],
    });

    // Convert to Blob
    const blob = await docx.Packer.toBlob(doc);
    const file = new File([blob], `${fileName}.docx`, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("resource_type", "raw");

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();

        if (data.secure_url) {
            saveFileLink(fileName, data.secure_url);
            alert("Word file saved successfully!");
            displaySavedFiles(); // Refresh file list
        }
    } catch (error) {
        console.error("File upload failed:", error);
        alert("Failed to save Word file.");
    }
}


function saveFileLink(name, url) {
    let files = JSON.parse(localStorage.getItem("savedFiles")) || [];
    files.push({ name, url });
    localStorage.setItem("savedFiles", JSON.stringify(files));
}

function displaySavedFiles() {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = ""; // Clear previous entries

    const files = JSON.parse(localStorage.getItem("savedFiles")) || [];
    if (files.length === 0) {
        fileList.innerHTML = "<p>No files saved yet.</p>";
        return;
    }

    files.forEach(({ name, url }) => {
        const div = document.createElement("div");
        div.classList.add("saved-file");

        const link = document.createElement("a");
        link.href = url;
        link.innerText = name;
        link.target = "_blank";

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "X";
        deleteBtn.onclick = () => removeFile(name);

        div.appendChild(link);
        div.appendChild(deleteBtn);
        fileList.appendChild(div);
    });
}

// Remove file from storage
function removeFile(name) {
    let files = JSON.parse(localStorage.getItem("savedFiles")) || [];
    files = files.filter(file => file.name !== name);
    localStorage.setItem("savedFiles", JSON.stringify(files));
    displaySavedFiles(); // Refresh file list
}

// Load saved files on page load
window.onload = function () {
    loadNotes();
    loadSavedImages();
    displaySavedFiles();
};

// File Upload Button Event Listener
document.getElementById("fileInput").addEventListener("change", handleFileUpload);
