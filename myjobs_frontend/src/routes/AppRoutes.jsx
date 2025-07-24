import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import LandingPage from "../pages/LandingPage"
import FacultyLogin from "../pages/faculty/FacultyLogin";
import JobOpportunities from "../pages/faculty/JobOpportunities";
import JobDetails from "../pages/faculty/JobDetails";
import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import ProfilePage from "../pages/faculty/profile/ProfilePage";
import Applications from "../pages/faculty/Applications";
import FacultyRegistration from "../pages/faculty/FacultyRegistration";
import RecruiterLogin from "../pages/recruiter/RecruiterLogin";
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import PostJob from "../pages/recruiter/PostJob";
import SavedProfiles from "../pages/recruiter/SavedProfiles";
import MarkedProfiles from "../pages/recruiter/MarkedProfiles";
import ContactUs from "../pages/recruiter/ContactUs";
import Feedback from "../pages/recruiter/Feedback";
import RecruiterRegistration from "../pages/recruiter/RecruiterRegistration";
import SearchFaculty from "../pages/recruiter/SearchFaculty";
import FacultyLayout from "../layouts/FacultyLayout";
import RecruiterLayout from "../layouts/RecruiterLayout";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isFaculty, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isFaculty) {
    return <Navigate to="/faculty/login" replace />;
  }

  return children;
};

const RecruiterPrivateRoute = ({ children }) => {
  const { isAuthenticated, isRecruiter, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isRecruiter) {
    return <Navigate to="/recruiter/login" replace />;
  }

  return children || <Outlet />;
};

export const AppRoutes = () => {
  const { isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      {/* Faculty Auth Routes */}
      <Route path="/faculty/login" element={<FacultyLogin />} />
      <Route path="/faculty/register" element={<FacultyRegistration />} />

      <Route path="/faculty" element={
        <PrivateRoute>
          <FacultyLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/edit" element={<ProfilePage />} />
        <Route path="applications" element={<Applications />} />
        <Route path="jobs" element={<JobOpportunities />} />
        <Route path="jobs/:id" element={<JobDetails />} />
      </Route>
      {/* Recruiter Auth Routes */}
      <Route path="/recruiter/login" element={<RecruiterLogin />} />
      <Route path="/recruiter/registration" element={<RecruiterRegistration />} />

      <Route path="/recruiter" element={<RecruiterLayout />}>
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="saved-profiles" element={<SavedProfiles />} />
        <Route path="marked-profiles" element={<MarkedProfiles />} />
        <Route path="contact-us" element={<ContactUs />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="search-faculty" element={<SearchFaculty />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
