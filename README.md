# Apple Notes Importer 📥

Apple Notes Importer is a desktop application built with Electron, allowing users to import files in Markdown, HTML, or plain text format into Apple Notes. It supports creating new notes in specified accounts and folders, simplifying the process of migrating notes from other platforms.

## Features

- **Supported Formats:** Import files in `.md`, `.html`, `.txt`, or even `.zip` archives containing these formats.
- **Drag-and-Drop:** Easily drag and drop files or folders to upload.
- **Folder Management:** Automatically create or verify folders in Apple Notes.
- **Multi-Account Support:** Select from multiple Apple Notes accounts (e.g., iCloud, Gmail).
- **Batch Import:** Import multiple files in one go.
- **Rich HTML Support:** Convert Markdown files to HTML before importing.
- **ZIP Archives:** Process `.zip` files containing supported note formats.

---

## Installation

1. Download the latest release from the [Releases](https://github.com/<username>/<repo>/releases) section.
2. Extract the downloaded file and run the app executable.

---

## Usage

1. **Launch the App:** Start the application after installation.
2. **Select Account:** Choose your Apple Notes account from the dropdown menu (e.g., iCloud, Gmail).
3. **Specify Folder:**
   - Enter the name of the folder where notes will be imported.
   - If the folder doesn’t exist, it will be created.
4. **Add Files:**
   - Use the file picker to upload `.md`, `.html`, or `.txt` files.
   - Drag and drop files or `.zip` archives directly into the drop area.
5. **Provide Note Title:** Enter a title for the imported notes.
6. **Process Files:** Click the button to start the import process.
7. **Success Notification:** Once completed, you’ll receive a success message.

---

## Screenshots

### Main Interface
![Main Interface](/screenshots/main-interface.png)

### Select Single File
![Select File](/screenshots/select-file.png)

### Drop-and-Drop
![Drag and Drop](/screenshots/drag-drop.gif)

---

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/<username>/<repo>.git
   cd <repo>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app in development mode:
   ```bash
   npm start
   ```

4. Build the app for production:
   ```bash
   npm run make
   ```

---

## Technical Details

### Built With

- [Electron](https://www.electronjs.org/)
- [JSZip](https://stuk.github.io/jszip/) for handling `.zip` files
- [Showdown](https://github.com/showdownjs/showdown) for Markdown to HTML conversion
- AppleScript for interacting with the Apple Notes application

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.

---

## Known Limitations

- Only supports macOS due to reliance on AppleScript.
- Requires the Apple Notes app to be installed and configured.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

For any issues or feature requests, please open an issue on the [GitHub Issues](https://github.com/<username>/<repo>/issues) page.