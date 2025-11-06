import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import KidsCoding from '@/pages/KidsCoding';
import KidsCodingEditor from '@/pages/KidsCodingEditor';
import { AuthContext } from '@/contexts/authContext';

export default function App() {
  // 默认视为已登录，便于直接进入工作台
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kids-coding" element={<KidsCoding />} />
        <Route path="/kids-coding/editor" element={<KidsCodingEditor />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </AuthContext.Provider>
  );
}
