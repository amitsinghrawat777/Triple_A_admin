import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import GetStarted from './pages/GetStarted';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Progress from './pages/Progress';
import DietPlan from './pages/DietPlan';
import Attendance from './pages/Attendance';
import UserInfoForm from './pages/UserInfoForm';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import { ThemeProvider } from './context/ThemeContext';
import Workouts from './pages/Workouts';
<<<<<<< Updated upstream
=======
import ProfileEdit from './pages/ProfileEdit';
import { ProfileProvider } from './context/ProfileContext';
import Membership from './pages/Membership';
import AdminMembership from './pages/AdminMembership';
import ForgotPassword from './pages/ForgotPassword';
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
<<<<<<< Updated upstream
        <Routes>
          <Route path="/welcome" element={<GetStarted />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user-info" element={<UserInfoForm />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route 
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/diet" element={<DietPlan />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
=======
        <ProfileProvider>
          <Routes>
            <Route path="/welcome" element={<GetStarted />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/user-info" element={<UserInfoForm />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/admin/membership" element={<AdminMembership />} />
            <Route 
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/diet" element={<DietPlan />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
            </Route>
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </ProfileProvider>
>>>>>>> Stashed changes
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;