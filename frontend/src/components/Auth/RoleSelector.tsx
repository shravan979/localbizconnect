import { useNavigate } from 'react-router-dom';

export default function RoleSelector() {
  const navigate = useNavigate();
  return (
    <div className="flex gap-4 justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <button 
        onClick={() => navigate('/signup/customer')}
        className="bg-white px-8 py-4 rounded-lg text-lg font-bold"
      >
        I'm a Customer
      </button>
      <button 
        onClick={() => navigate('/signup/provider')}
        className="bg-white px-8 py-4 rounded-lg text-lg font-bold"
      >
        I'm a Service Provider
      </button>
    </div>
  );
}
