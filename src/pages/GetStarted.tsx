import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GetStarted() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-blue-600">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen text-center">
        <div className="bg-emerald-100 p-5 rounded-full mb-8 animate-bounce">
          <Dumbbell className="w-16 h-16 text-emerald-600" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Welcome to FitTrack Pro
        </h1>
        
        <p className="text-xl text-white/90 mb-12 max-w-2xl">
          Your personal fitness companion. Track workouts, monitor progress, and achieve your fitness goals with our comprehensive platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Link 
            to="/login" 
            className="flex-1 bg-white text-emerald-600 py-4 px-8 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center group"
          >
            Sign In
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            to="/signup" 
            className="flex-1 bg-emerald-600 text-white py-4 px-8 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center group"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-white">
            <h3 className="text-xl font-semibold mb-3">Track Progress</h3>
            <p className="text-white/80">
              Monitor your fitness journey with detailed progress tracking and analytics
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-white">
            <h3 className="text-xl font-semibold mb-3">Custom Workouts</h3>
            <p className="text-white/80">
              Access personalized workout plans tailored to your fitness goals
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl text-white">
            <h3 className="text-xl font-semibold mb-3">Diet Plans</h3>
            <p className="text-white/80">
              Get customized nutrition guidance to support your fitness journey
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 