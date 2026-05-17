import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ResearchFeed from './pages/ResearchFeed';
import ArticleDetail from './pages/ArticleDetail';
import ManuscriptSubmission from './pages/ManuscriptSubmission';
import Notifications from './pages/Notifications';
import MyArticles from './pages/MyArticles';
import PeerReviewInbox from './pages/PeerReviewInbox';
import UserProfile from './pages/UserProfile';
import ReviewerDashboard from './pages/ReviewerDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import UserManagement from './pages/UserManagement';
import BulkPaperUpload from './pages/BulkPaperUpload';
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import BookmarksPage from './pages/Bookmarks';
import LeaderboardPage from './pages/Leaderboard';
import MyPoints from './pages/MyPoints';
import EmailVerification from './pages/EmailVerification';
import ResendVerification from './pages/ResendVerification';
import CategoryPage from './pages/CategoryPage';
import { useGetUserProfileQuery, useUpdateProfileMutation } from './api/baseApi';
import { AuthProvider } from './contexts/AuthContext';


const Profile = () => (
  <div className="max-w-4xl space-y-12 animate-in fade-in duration-1000">
    <div className="flex flex-col md:flex-row items-center gap-12 bg-white p-12 rounded-[3rem] shadow-sm border border-gray-50">
      <div className="w-48 h-48 rounded-[2rem] bg-accent/10 border-4 border-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-accent text-6xl font-serif">AS</div>
      <div className="text-center md:text-left flex-1">
        <h1 className="text-5xl font-serif font-bold text-primary mb-4 tracking-tight">Academic Scholar</h1>
        <p className="text-lg text-accent font-bold mb-4">Senior Research Fellow • MIT Laboratory for AI</p>
        <p className="text-sm text-gray-400 font-medium max-w-lg leading-relaxed italic">Dedicated to exploring the intersection of quantum mechanics and computational biology with over 15 years of academic excellence.</p>
        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
          <div className="px-6 py-3 bg-[#F7FAFC] rounded-2xl text-center min-w-[120px]">
            <p className="text-2xl font-bold text-primary">124</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Publications</p>
          </div>
          <div className="px-6 py-3 bg-[#F7FAFC] rounded-2xl text-center min-w-[120px]">
            <p className="text-2xl font-bold text-primary">3.5k</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Citations</p>
          </div>
          <div className="px-6 py-3 bg-accent/5 rounded-2xl text-center min-w-[120px]">
            <p className="text-2xl font-bold text-accent">98%</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Peer Review Score</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Settings = () => {
  const { data: user, isLoading } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [profileImage, setProfileImage] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [formData, setFormData] = React.useState({
    first_name: '',
    last_name: '',
    email: '',
    institution: '',
    field_of_study: '',
    academic_status: '',
    bio: '',
  });
  const [preferences, setPreferences] = React.useState({
    email_notifications: true,
    public_profile: true,
    show_email: false,
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        institution: user.institution || '',
        field_of_study: user.field_of_study || '',
        academic_status: user.academic_status || '',
        bio: user.bio || '',
      });
      setImagePreview(user.avatar || null);
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) formDataToSend.append(key, formData[key]);
    });
    if (profileImage) formDataToSend.append('avatar', profileImage);
    formDataToSend.append('email_notifications', preferences.email_notifications);
    formDataToSend.append('public_profile', preferences.public_profile);
    formDataToSend.append('show_email', preferences.show_email);

    try {
      await updateProfile(formDataToSend).unwrap();
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif font-bold text-primary tracking-tight">Account Settings</h1>
        <p className="text-gray-400 font-medium italic">Manage your account preferences and security settings.</p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-50 space-y-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-primary">Profile Information</h2>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 block">Profile Image</label>
              <div
                onClick={() => document.getElementById('profile-image-upload').click()}
                className="w-40 h-40 rounded-2xl bg-accent/5 border-2 border-dashed border-accent/30 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/10 transition-all group overflow-hidden"
              >
                <input
                  id="profile-image-upload"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent group-hover:scale-110 transition-transform mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-[10px] font-bold text-accent uppercase tracking-widest text-center">Upload</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full bg-[#F7FAFC] border-none rounded-2xl py-3 px-5 text-primary font-bold focus:ring-4 focus:ring-accent/5 outline-none"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full bg-[#F7FAFC] border-none rounded-2xl py-3 px-5 text-primary font-bold focus:ring-4 focus:ring-accent/5 outline-none"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#F7FAFC] border-none rounded-2xl py-3 px-5 text-primary font-bold focus:ring-4 focus:ring-accent/5 outline-none"
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Institution</label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="w-full bg-[#F7FAFC] border-none rounded-2xl py-3 px-5 text-primary font-bold focus:ring-4 focus:ring-accent/5 outline-none"
                    placeholder="Your institution"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Field of Study</label>
                  <input
                    type="text"
                    name="field_of_study"
                    value={formData.field_of_study}
                    onChange={handleInputChange}
                    className="w-full bg-[#F7FAFC] border-none rounded-2xl py-3 px-5 text-primary font-bold focus:ring-4 focus:ring-accent/5 outline-none"
                    placeholder="Your field of study"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Academic Status</label>
                <select
                  name="academic_status"
                  value={formData.academic_status}
                  onChange={handleInputChange}
                  className="w-full bg-[#F7FAFC] border-none rounded-2xl py-3 px-5 text-primary font-bold focus:ring-4 focus:ring-accent/5 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select Status</option>
                  <option value="undergraduate">Undergraduate</option>
                  <option value="graduate">Graduate</option>
                  <option value="phd">PhD</option>
                  <option value="professor">Professor</option>
                  <option value="researcher">Researcher</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full bg-[#F7FAFC] border-none rounded-2xl py-3 px-5 text-primary font-medium focus:ring-4 focus:ring-accent/5 outline-none resize-none"
                  placeholder="Write a short bio about yourself..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-gray-100" />

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary">Security</h2>
          <div className="space-y-4">
            <button className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:opacity-90 transition-all">Change Password</button>
            <button className="px-8 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all">Delete Account</button>
          </div>
        </div>

        <div className="w-full h-px bg-gray-100" />

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary">Preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-[#F7FAFC] rounded-2xl cursor-pointer">
              <span className="text-sm font-bold text-primary">Email Notifications</span>
              <input
                type="checkbox"
                checked={preferences.email_notifications}
                onChange={(e) => setPreferences({ ...preferences, email_notifications: e.target.checked })}
                className="w-6 h-6 accent-accent"
              />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#F7FAFC] rounded-2xl cursor-pointer">
              <span className="text-sm font-bold text-primary">Public Profile</span>
              <input
                type="checkbox"
                checked={preferences.public_profile}
                onChange={(e) => setPreferences({ ...preferences, public_profile: e.target.checked })}
                className="w-6 h-6 accent-accent"
              />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#F7FAFC] rounded-2xl cursor-pointer">
              <span className="text-sm font-bold text-primary">Show Email on Profile</span>
              <input
                type="checkbox"
                checked={preferences.show_email}
                onChange={(e) => setPreferences({ ...preferences, show_email: e.target.checked })}
                className="w-6 h-6 accent-accent"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-accent hover:bg-[#287E7B] text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#F7FAFC] text-text">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:uid/:token" element={<EmailVerification />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/complete-profile" element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } />

          {/* Protected Routes (Using MainLayout) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/explore" element={<ResearchFeed />} />
              <Route path="/article/:slug" element={<ArticleDetail />} />
              <Route path="/submit" element={<ManuscriptSubmission />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/my-articles" element={<MyArticles />} />
              <Route path="/peer-review" element={<PeerReviewInbox />} />
              <Route path="/reviewer/dashboard" element={
                <ProtectedRoute requiredRole="reviewer">
                  <ReviewerDashboard />
                </ProtectedRoute>
              } />
              {/* Admin Routes - No MainLayout, uses own sidebar */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/user-management" element={
                <ProtectedRoute requiredRole="admin">
                  <SuperAdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/bulk-upload" element={
                <ProtectedRoute requiredRole="admin">
                  <BulkPaperUpload />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/profile/:username" element={<UserProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/points/my" element={<MyPoints />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
