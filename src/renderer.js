document.addEventListener("DOMContentLoaded", () => {
  console.log("👋 Renderer loaded");

  // Load accounts on page load
  async function loadAccounts() {
    const accounts = await window.api.getAccounts();
    const accountSelect = document.getElementById("accountSelect");
    if (!accountSelect) return; // Safeguard for missing accountSelect element

    accounts.forEach((account) => {
      const option = document.createElement("option");
      option.value = account;
      option.textContent = account;
      accountSelect.appendChild(option);
    });
  }

  // Event listener for each file type button
  document.querySelectorAll(".file-option").forEach((button) => {
    button.addEventListener("click", () => {
      const fileType = button.getAttribute("data-type");
      const fileInput = document.createElement("input");
      fileInput.type = "file";

      // Set accepted file type based on button clicked
      fileInput.accept =
        fileType === "markdown"
          ? ".md"
          : fileType === "html"
          ? ".html"
          : fileType === "text"
          ? ".txt"
          : "";

      // Trigger file selection
      fileInput.click();

      // Handle selected file
      fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const content = await file.text();
        const format = file.name.split(".").pop();
        let parsedContent = "";

        if (format === "md") {
          parsedContent = await window.api.convertMarkdown(content);
        } else if (format === "html") {
          parsedContent = content;
        } else if (format === "txt") {
          parsedContent = `<pre>${content}</pre>`;
        } else {
          alert("Unsupported file format");
          return;
        }

        // Safely retrieve the input elements and handle null values
        const titleElement = document.getElementById("noteTitle");
        const accountElement = document.getElementById("accountSelect");
        const folderElement = document.getElementById("folderInput");

        const title = titleElement ? titleElement.value : "Untitled Note";
        const account = accountElement ? accountElement.value : "";
        const folder = folderElement ? folderElement.value || "Notes" : "Notes";

        // Ensure folder exists (or create it if it doesn’t)
        const folderExists = await window.api.createOrCheckFolder(account, folder);
        if (!folderExists) {
          alert("Failed to create or find the specified folder");
          return;
        }

        // Import the note
        const result = await window.api.importNote(parsedContent, title, account, folder);
        alert(result ? "Note imported successfully" : "Failed to import note");
      });
    });
  });

  // Initialize by loading accounts
  loadAccounts();
});
