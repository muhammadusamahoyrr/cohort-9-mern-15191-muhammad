import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NoteEditor from './pages/NoteEditor';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Register from './pages/Register';

// Shell for every signed-in screen: navbar on top, page below.
function AppLayout() {
  return (
    <div className="app">
      <Navbar />
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/notes/new" element={<NoteEditor />} />
        <Route path="/notes/:id" element={<NoteEditor />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Old bookmarks from before the dashboard moved to "/". */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
