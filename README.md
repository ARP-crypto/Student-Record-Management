# CampusList — Student Record Management System

A responsive web application developed for the **Student Record Management System Using Linked Lists** Data Structures and Algorithms mini-project. The website allows users to add, view, search, edit, and remove student records while analyzing student performance.

## Features

- **Add Student:** Add student records with roll number, name, and marks.
- **Display Students:** View all existing student records.
- **Search Student:** Find a student by roll number or name.
- **Edit Student Data:** Update existing student information.
- **Remove Student:** Delete a student record.
- **Count Students:** Calculate the total number of students.
- **Performance Statistics:** Calculate average marks, pass/fail counts, pass/fail percentages, and highest/lowest marks.
- **CSV Export:** Export student records for backup.
- **Data Persistence:** Save records in browser local storage.
- **Responsive Design:** Access the website on desktop, tablet, and mobile devices.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Singly Linked List
- Browser Local Storage

## Project Structure

```text
student-record-management-website/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Installation and Usage

1. Download or clone the repository.
2. Extract the project files if downloaded as a ZIP.
3. Ensure `index.html`, `styles.css`, and `script.js` are in the same folder.
4. Open `index.html` in a modern web browser.
5. Use the dashboard to manage student records.

No additional packages or build tools are required.

## Running with a Local Server

You can optionally run the project through a local server using Python:

```bash
python -m http.server 8000
```

Open the following address in your browser:

`http://localhost:8000`

## Linked List Implementation

The project demonstrates the practical use of a singly linked list.

| Feature | DSA Concept |
|---|---|
| Add Student | Insertion |
| Display Students | Traversal |
| Search Student | Linear Search |
| Edit Student Data | Data Modification |
| Remove Student | Deletion |
| Count Students | Traversal |
| Performance Statistics | Traversal and Calculation |

Each student is represented as a node containing student information and a reference to the next node. The list begins at the head pointer and ends when the next pointer is null.

## Performance Calculation

The application calculates the average marks using:

**Average Marks = Total Marks / Number of Students**

The project uses the following passing criteria:

- Marks greater than or equal to 40: PASS
- Marks below 40: FAIL

Pass and fail percentages are calculated based on the total number of student records.

## Deploying on GitHub Pages

1. Create a repository on [GitHub](https://github.com/).
2. Upload `index.html`, `styles.css`, `script.js`, and `README.md` to the repository root.
3. Navigate to **Settings → Pages**.
4. Under Build and deployment, select **Deploy from a branch**.
5. Choose the `main` branch and the `/(root)` folder.
6. Click **Save**.
7. After deployment, open the published website URL displayed in the Pages settings.

## Data Storage and Privacy

Student records are stored in the browser's local storage. They remain available in the same browser profile on the same device after refreshing the website.

The current version does not use a shared backend database. Records are not automatically synchronized between devices or browsers. Use the CSV export feature to maintain a backup.

Avoid entering sensitive personal information into a public demonstration website.

## Future Enhancements

- User authentication and administrator access
- Database integration
- Subject-wise marks and grades
- Attendance management
- CGPA calculation
- Student ranking and sorting
- Downloadable academic reports

## Conclusion

CampusList demonstrates how linked-list operations can be applied to a practical student record management application. It combines dynamic record management with student performance analysis and provides a practical learning experience in Data Structures and Algorithms using JavaScript.

## License

This project is intended for educational use. Add an appropriate open-source license if you intend to distribute it under specific licensing terms.
