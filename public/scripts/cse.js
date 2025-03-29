
document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:5000/get-files"; // Your backend API

  async function fetchFiles() {
      try {
          const response = await fetch(API_URL);
          const files = await response.json();

          document.querySelectorAll("a[data-file]").forEach(link => {
              const fileKey = link.getAttribute("data-file");
              const loadingText = document.getElementById(`loading-${fileKey}`);

              if (files[fileKey]) {
                  link.href = files[fileKey]; // Set Cloudinary URL
                  link.target = "_blank"; // Open in new tab
                  link.download = ""; // Allow direct download
                  if (loadingText) loadingText.textContent = "✅ Ready";
              } else {
                  if (loadingText) loadingText.textContent = "❌ Not Available";
              }
          });
      } catch (error) {
          console.error("Error fetching files:", error);
      }
  }

  fetchFiles();
});


const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        header.classList.toggle('active');
        content.classList.toggle('open');
      });
    });
