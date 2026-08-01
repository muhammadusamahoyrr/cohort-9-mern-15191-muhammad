import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import ProtectedRoute from './components/ProtectedRoute';
import EditorEmpty from './pages/EditorEmpty';
import Login from './pages/Login';
import NoteEditor from './pages/NoteEditor';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Workspace from './pages/Workspace';

function AppLayout() {
  return (
    <div className="app">
      <AppHeader />
      <Outlet />
    </div>
  );
}

function PageLayout() {
  return (
    <main className="page">
      <Outlet />
    </main>
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
        <Route element={<Workspace />}>
          <Route path="/" element={<EditorEmpty />} />
          <Route path="/notes/new" element={<NoteEditor />} />
          <Route path="/notes/:id" element={<NoteEditor />} />
        </Route>

        <Route element={<PageLayout />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
