import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import Cleaning from '@/pages/Cleaning';
import Messages from '@/pages/Messages';
import Statistics from '@/pages/Statistics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/cleaning" element={<Cleaning />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
