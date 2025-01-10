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
import ProfileEdit from './pages/ProfileEdit';
import { ProfileProvider } from './context/ProfileContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <Routes>
            <Route path="/welcome" element={<GetStarted />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/user-info" element={<UserInfoForm />} />
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
              <Route path="/profile/edit" element={<ProfileEdit />} />
            </Route>
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;