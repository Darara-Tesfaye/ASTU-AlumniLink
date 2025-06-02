🌟 ASTUALUMNILINK
    🚀 A networking platform for ASTU alumni, students, faculty, and companies to connect, mentor, and discover opportunities.


📌 Table of Contents
        Project Overview
        Features
        Technology Stack
        Folder Structure
        Installation Guide
        Running the Project
        API Endpoints
        Contributors
        License
📖 Project Overview
    ASTUALUMNILINK is a dedicated platform aimed at fostering connections between alumni, students, faculty, and companies associated with Adama Science and Technology University (ASTU). It serves to:

        ✅ Alumni: Mentor students and showcase job opportunities.
        ✅ Students: Seek mentorship, internships, and networking experiences.
        ✅ Faculty: Coordinate events and disseminate resources.
        ✅ Companies: Advertise job openings and scout talented individuals.
        🔥 Features
        ✅ User Authentication: Secure sign-up and sign-in for all users.
        ✅ Mentorship Program: Students can request guidance from alumni and faculty.
        ✅ Job & Internship Listings: Companies can post job vacancies, while students can apply effortlessly.
        ✅ Discussion Forums: A space for alumni and students to discuss career insights and industry trends.
        ✅ Event Management: Facilitate networking and career-related events for the ASTU community.
        ✅ Admin Panel: Oversee user management, posts, and system settings.
🛠️ Technology Stack
        Frontend
             React.js: A powerful UI framework to build interactive user interfaces.
             Tailwind CSS: A utility-first CSS framework for styling.
            Axios: For making API calls.
            React Router: For seamless navigation between components.
        Backend
            Django: A robust web framework for building backend services.
            Django REST Framework: Simplifies API development.
            MySQL: A reliable database solution.
            JWT Authentication: Provides secure login mechanisms.
            Django CORS Headers: Enables frontend-backend communication.
📂 Folder Structure
            ASTUALUMNILINK/  
            ├── frontend/     # Frontend codebase  
            │   ├── src/      # Source files for the React application  
            │   └── public/   # Public assets  
            └── backend/      # Backend codebase  
                ├── app/      # Main application files  
            └── config/       # Configuration files and settings  
📥 Installation Guide
            To set up the project locally, follow these steps:

Clone the repository:

        bash
        git clone https://github.com/yourusername/ASTUALUMNILINK.git  
        cd ASTUALUMNILINK  
        Setup the Frontend:
        
        bash
        cd frontend  
        npm install  
        Setup the Backend:
        
        bash
        cd backend  
        pip install -r requirements.txt  
        Configure your database settings in backend/app/settings.py.

Run Database Migrations:
        
        bash
        python manage.py migrate  
        ▶️ Running the Project
        Start the Backend Server:
        
        bash
        cd backend  
        python manage.py runserver  
        Start the Frontend Application:
        
        bash
        cd frontend  
        npm start  
        📡 API Endpoints
        Here are some key API endpoints:
        
        GET /api/users/: Retrieve all users
        POST /api/users/login/: User login
        GET /api/jobs/: List job postings
        POST /api/jobs/: Create a new job posting
👥 Contributors
       Contributions are welcome! Meet our amazing team:

   Frontend Developers: Roba Chimdesa, Bontu Dereje, Nugusa Wakwaya
   Backend Developers: Darara Tesfaye, Milkesa Kasaye
📄 License
        This project is licensed under the MIT License - see the LICENSE file for details.
