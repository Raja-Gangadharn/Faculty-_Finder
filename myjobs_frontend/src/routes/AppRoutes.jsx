import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/* ---------- Public Pages ---------- */
import LandingPage from "../pages/LandingPage";

/* ---------- Faculty Pages ---------- */
import FacultyLogin from "../pages/faculty/FacultyLogin";
import FacultyRegistration from "../pages/faculty/FacultyRegistration";
import FacultyLayout from "../layouts/FacultyLayout";
import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import ProfilePage from "../pages/faculty/profile/ProfilePage";
import JobOpportunities from "../pages/faculty/JobOpportunities";
import JobDetails from "../pages/faculty/JobDetails";
import SavedJobs from "../pages/faculty/SavedJobs";
import Communication from "../pages/faculty/Communication";
/* ---------- Recruiter Pages ---------- */
import RecruiterLogin from "../pages/recruiter/RecruiterLogin";
import RecruiterRegistration from "../pages/recruiter/RecruiterRegistration";
import RecruiterLayout from "../layouts/RecruiterLayout";
import RecruiterDashboard from "../pages/recruiter/RecruiterDashboard";
import PostJob from "../pages/recruiter/PostJob";
import SavedProfiles from "../pages/recruiter/SavedProfiles";
import MarkedProfiles from "../pages/recruiter/MarkedProfiles";
import SearchFaculty from "../pages/recruiter/SearchFaculty";
import FacultyDetails from "../pages/recruiter/FacultyDetails";
import RecruiterCommunication from "../pages/recruiter/Communication";

/* ========== Guards ========== */
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

const RecruiterPrivateRoute = () => {
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

  return <Outlet />;
};

/* ========== Routes ========== */
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
      {/* ---------- Public ---------- */}
      <Route path="/" element={<LandingPage />} />

      {/* ---------- Faculty Auth ---------- */}
      <Route path="/faculty/login" element={<FacultyLogin />} />
      <Route path="/faculty/register" element={<FacultyRegistration />} />

      {/* ---------- Faculty App (Protected) ---------- */}
      <Route
        path="/faculty"
        element={
          <PrivateRoute>
            <FacultyLayout />
          </PrivateRoute>
        }
      >
        {/* default redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* main pages */}
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/edit" element={<ProfilePage />} />

        {/* jobs */}
        <Route path="jobs">
          <Route index element={<JobOpportunities />} />
          <Route path=":id" element={<JobDetails />} />
        </Route>

        {/* saved jobs and communication */}
        <Route path="saved-jobs" element={<SavedJobs />} />
        <Route path="communication" element={<Communication />} />
      </Route>

      {/* ---------- Recruiter Auth ---------- */}
      <Route path="/recruiter/login" element={<RecruiterLogin />} />
      <Route path="/recruiter/registration" element={<RecruiterRegistration />} />

      {/* ---------- Recruiter App (Protected) ---------- */}
      <Route element={<RecruiterPrivateRoute />}>
        <Route path="/recruiter" element={<RecruiterLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="saved-profiles" element={<SavedProfiles />} />
          <Route path="marked-profiles" element={<MarkedProfiles />} />
          <Route path="search-faculty" element={<SearchFaculty />} />
          <Route path="faculty/:id" element={<FacultyDetails />} />
          <Route path="communication" element={<RecruiterCommunication />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
          {/* <Route path="contact-us" element={<ContactUs />} />
          <Route path="feedback" element={<Feedback />} /> */}
        </Route>
      </Route>

      {/* ---------- 404 ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
