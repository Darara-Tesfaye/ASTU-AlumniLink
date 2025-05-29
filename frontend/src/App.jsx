import react from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Login from './pages/Login'
import RegisterForm from "./components/RegistrationForm"
import LandingPage from "./pages/LandingPage";
// import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/Notfound";
import ProtectedRoute from "./components/ProtectedRoute";
// import { useState } from "react";

import Dashboard from './components/Dashboard/Dashboard'
// import UserSearch from "./components/User_Search";
import DashboardLayout from './components/Dashboard/DashboardLayout';
import UserProfile from "./components/User Profile/Userprofile";
import ProfileLayout from "./components/User Profile/Profilelayout";


//  MentorSearchLayout
import MentorSearch from "./components/Mentor Search/MentorSearch";
import MentorSearchLayout from "./components/Mentor Search/MentorSearchLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
import ManageUsers from "./components/Admin/ManageUsers";
import EventsLayout from "./components/Events/EventsLayout";
import CreateEventForm from "./components/Events/Create_Events";

import FriendList from "./components/Chat/FriendList";
import ChatPage from "./components/Chat/chat";


import ManageEvents from "./components/Admin/ManageEvents";
import AdminManageOpportunities from "./components/Admin/ManageOpportunities";
import FeedbackList from "./components/Admin/Feedback";
import AdminPageLayout from "./components/Admin/AdminPageLayout";
import AdminNotifications from "./components/Admin/AdminNotifications";

import ForgotPassword from "./components/forgotPassword";
import ManageOpportunities from "./components/Opportunity/ManageOpportunity";
import OpportunitiesLayout from "./components/Opportunity/OpportunityLayout";
import BrowseInternship from "./components/Opportunity/BrowseInternship";
import BrowseJob from "./components/Opportunity/BrowseJob";
import ApplyInternship from "./components/Opportunity/ApplyInternship";
import ApplyJob from "./components/Opportunity/ApplyJob";
import ApplicantPage from "./components/Opportunity/AppllicantListPage";
import JobApplicantPage from "./components/Opportunity/JobApplicantListPage";

import ResourceShareUpload from "./components/Resource Sharing/Resourceshare";
import AccessResources from "./components/Resource Sharing/AccessResource";

import Notifications from "./components/Notifications";
import EventDetail from "./components/Events/Eventdetail";
import UserEventList from "./components/Events/ListEvents";
import UserProfilePage from "./components/ProfilePage";
import ForumList from "./components/Forum/ListofDiscussion";
// import AdminEventForum from "./components/Forum/AdminEventForum";
import EventForum from "./components/Forum/EventForum";
import AdminForumDashboard from "./components/Forum/AdminForumPage";


import { User } from "lucide-react";

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function Registerandlogout() {
  localStorage.clear()
  return <RegisterForm />

}
function App() {

  return (
    <BrowserRouter>

      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admindashboard"
          element={
            <ProtectedRoute>
              <AdminPageLayout>
                <AdminDashboard />
              </AdminPageLayout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/admin-notifications"
          element={
            <ProtectedRoute>
              <AdminPageLayout>
                <AdminNotifications />
              </AdminPageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/manage-opportunity"
          element={
            <ProtectedRoute>
              <OpportunitiesLayout>
                <ManageOpportunities />
              </OpportunitiesLayout>
            </ProtectedRoute>
          }
        />
          <Route
          path="/feedback-list"
          element={
            <ProtectedRoute>
              <AdminPageLayout>
                <FeedbackList />
              </AdminPageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-opportunities"
          element={
            <ProtectedRoute>
              <AdminPageLayout>
              <AdminManageOpportunities />
              </AdminPageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/friendlist"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <FriendList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resource-share"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ResourceShareUpload />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/access-resource"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AccessResources />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Notifications />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />



        <Route
          path="/chat/:friendId"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ChatPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply-internship/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ApplyInternship />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply-job/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ApplyJob />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/internship-opportunity"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BrowseInternship />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-opportunity"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BrowseJob />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/applicant"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ApplicantPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-applicant"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <JobApplicantPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/event_list"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UserEventList />
              </DashboardLayout>
            </ProtectedRoute>

          }
        />
        <Route
          path="/event_list/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <EventDetail />
              </DashboardLayout>
            </ProtectedRoute>

          }
        />
        <Route 
        path="/forum-list"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ForumList />
            </DashboardLayout>
          </ProtectedRoute>
        }
        />

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registerandlogout />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/#about" element={<LandingPage />} />
        <Route path="/#contact" element={<LandingPage />} />
        <Route path="/profile" element={
          <ProfileLayout>
            <UserProfile />
          </ProfileLayout>
        } />

        <Route path="/profile/:id"
         element={
          <ProtectedRoute>
            <UserProfilePage />
          </ProtectedRoute>
          
        } />

        <Route path="/create-event" element={
          <ProtectedRoute>
            <EventsLayout>
              <CreateEventForm />
            </EventsLayout>
          </ProtectedRoute>
        } />
        <Route path="/find-mentor" element={
          <MentorSearchLayout>
            <MentorSearch />
          </MentorSearchLayout>
        } />
        

        <Route path="/events" 
        element={
          <ProtectedRoute>
            <AdminPageLayout>
              <ManageEvents />
            </AdminPageLayout>
          </ProtectedRoute>
        } 
        />
        <Route path="/manageusers"
        element={
          <ProtectedRoute>
            <AdminPageLayout>
              <ManageUsers />
            </AdminPageLayout>
          </ProtectedRoute>
        }
        />
        <Route path="/admin/forum/event/:eventId" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AdminForumDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
        />
        <Route path="/forum/event/:eventId" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EventForum />
            </DashboardLayout>
          </ProtectedRoute>
        }
        />
        <Route path="/forgotpassword" element={<ForgotPassword />} />



      </Routes>


    </BrowserRouter>
  )
}

export default App
