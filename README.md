🚀 Real-Time Collaboration Task Board

A full-stack web application that allows users to create boards, manage tasks, and collaborate in real-time.



Features:-
----------------------
*User Authentication (Login / Signup)
*Real-time collaboration using Socket.IO
*Create and manage boards
*Add, edit, delete tasks
*Drag and drop tasks between columns
*Live updates across multiple users
*Clean and responsive UI


Tech Stack:-
------------------
Frontend:-React.js,Bootstrap,Axios,@hello-pangea/dnd (Drag & Drop)

Backend:-Node.js,Express.js,MongoDB,Socket.IO,JWT Authentication


📁 Project Structure:-
-----------------------------
real_time_collaboration/

│
├── backend/
│ ├── models/
│ ├── routes/
│ ├── controllers/
│ ├── middleware/
│ └── server.js

│
├── frontend/
│ ├── src/
│ ├── components/
│ ├── pages/
│ └── main.jsx

│
└── README.md



⚙️ Installation & Setup:-
----------------------------------
1️) Clone the repository

git clone https://github.com/vijaycode12/real_time_collaboration.git

cd real_time_collaboration

2️)Setup Backend

cd backend
npm install

Create a .env file in backend folder:

PORT=4000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

Run backend:

npm start

3️)Setup Frontend

cd ../frontend
npm install
npm run dev

Running the App:-
-----------------------
Frontend → http://localhost:5173

Backend → http://localhost:4000

Real-Time Functionality:-
------------------------------
This project uses Socket.IO to enable real-time updates.
When:
a task is created
a task is moved
a task is deleted

All connected users will instantly see the updates.

API Endpoints (Sample):-
--------------------------
Method | Endpoint | Description
POST | /api/auth/sign-up | Register user
POST | /api/auth/log-in | Login user
GET | /api/boards | Get boards
POST | /api/boards | Create board
PUT | /api/tasks/:id | Update task
DELETE | /api/tasks/:id | Delete task

Author:-
--------------------
D Vijay

GitHub: https://github.com/vijaycode12

📄 License:-
----------------------
This project is for educational and assignment purposes.
