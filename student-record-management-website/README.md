# CampusList — Student Record Management System

A responsive, browser-based website for the **Student Record Management System Using Linked Lists** DSA mini-project. It is built with HTML, CSS, and vanilla JavaScript, with the student records maintained in a singly linked list.

## Features

- **Add Student** — creates a node and appends it to the linked list.
- **Display Students** — traverses and displays records.
- **Search Student** — search by roll number or name in the directory.
- **Edit Student Data** — updates a student's name and marks without replacing the node.
- **Remove Student** — unlinks and removes a node after confirmation.
- **Count Students** — displays the current number of linked-list nodes.
- **Performance Statistics** — calculates the average, pass/fail totals, percentages, and highest/lowest marks by traversing the list.
- **Exit Application** — explains local save behavior before leaving the page.
- **CSV export** — download a copy of the records.
- **Browser persistence** — uses `localStorage` so records remain after refreshing the same browser on the same device.
- **Responsive layout** — adapts to desktop, tablet, and mobile screens.

## Passing rule

A student passes with **40 marks or above**. Marks must be between 0 and 100. You can change the threshold by updating `PASS_MARK` near the top of `script.js`.

## Run locally

No installation or build step is required.

1. Download or clone this repository.
2. Open `index.html` in a modern web browser.
3. Add student records from the dashboard.

For a local development server, you can use the VS Code Live Server extension or run Python from this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish on GitHub Pages

1. Create a new GitHub repository, for example `student-record-management-system`.
2. Upload `index.html`, `styles.css`, `script.js`, and this `README.md` to the repository root.
3. Open **Settings → Pages** in the repository.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to publish the site and open the URL shown on the Pages settings screen.

## Project structure

```text
student-record-management-website/
├── index.html     # Page structure and dialogs
├── styles.css     # Responsive dashboard styling
├── script.js      # Linked-list operations, statistics, storage, and UI behavior
└── README.md      # Project and deployment instructions
```

## Data storage and privacy

This is a static front-end website. Student records are stored in the browser's local storage, not in a server database. They are available only in the same browser profile on the same device. Clearing browser data or using another device/browser will not transfer those records. Use the **Export CSV** button to keep a separate backup. Do not enter sensitive personal information into a public demonstration site.

## Linked-list implementation

The `StudentLinkedList` class in `script.js` contains the `head` pointer and linked nodes. Its core methods are `add`, `findByRoll`, `update`, `remove`, `toArray`, and `count`. Statistics are calculated by walking node by node, mirroring the operations from the C mini-project.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Browser `localStorage` and Blob APIs for persistence and CSV export

## License

For educational use. Add a license file if you plan to distribute this project under a specific open-source license.
