document.addEventListener("DOMContentLoaded", () => {
  console.log("👋 Renderer loaded");

  async function loadAccounts() {
    const accounts = await window.api.getAccounts();
    const accountSelect = document.getElementById("accountSelect");
    accounts.forEach((account) => {
      const option = document.createElement("option");
      option.value = account;
      option.textContent = account;
      accountSelect.appendChild(option);
    });
  }

  loadAccounts();

  // Event listener for file option buttons
  document.querySelectorAll(".file-option").forEach((button) => {
    button.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.multiple = true;
      fileInput.accept = button.getAttribute("data-type") === "markdown" ? ".md" :
                         button.getAttribute("data-type") === "html" ? ".html" :
                         button.getAttribute("data-type") === "text" ? ".txt" : "";
      fileInput.click();
      fileInput.addEventListener("change", () => handleFiles(fileInput.files));
    });
  });

  const dropArea = document.getElementById("dropArea");
  const fileInput = document.getElementById("fileInput");
  const selectFileButton = document.getElementById("selectFileButton");

  // Drag-and-drop functionality
  ["dragenter", "dragover"].forEach((eventName) => {
    dropArea.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropArea.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove("dragover"));
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  });

  // Open file picker when clicking on drop area, but not on button
  dropArea.addEventListener("click", () => fileInput.click());

  // Prevent event propagation when clicking the button
  selectFileButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevents the click event from reaching the dropArea
    fileInput.click(); // Opens the file input dialog
  });

  // Handle file input selection
  fileInput.addEventListener("change", () => handleFiles(fileInput.files));

  async function handleFiles(files) {
    const titleElement = document.getElementById("noteTitle");
    const accountElement = document.getElementById("accountSelect");
    const folderElement = document.getElementById("folderInput");
  
    // Safely retrieve values with fallbacks in case elements are missing
    const title = titleElement ? titleElement.value : "Untitled Note";
    const account = accountElement ? accountElement.value : "";
    const folder = folderElement ? folderElement.value || "Notes" : "Notes";
  
    // Ensure the folder exists (create it if it doesn’t)
    const folderExists = await window.api.createOrCheckFolder(account, folder);
    if (!folderExists) {
      alert("Failed to create or find the specified folder");
      return;
    }
  
    // Prepare file data to send to the main process
    const fileData = await Promise.all([...files].map(async (file) => ({
      name: file.name,
      data: await file.arrayBuffer(),
      isZip: file.name.endsWith(".zip")
    })));
  
    // Send file data to main process for processing
    const success = await window.api.processFiles(fileData, title, account, folder);
    alert(success ? "Files processed successfully" : "Error processing files.");
  }  
});
