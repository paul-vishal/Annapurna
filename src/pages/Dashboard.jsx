import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '10px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{ margin: '0 0 10px 0', color: '#667eea' }}>MealVP Dashboard</h1>
            <p style={{ margin: 0, color: '#666' }}>Welcome back, {user?.name}!</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Logout
          </button>
        </div>

        <div style={{
          background: '#f5f5f5',
          padding: '30px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#333', marginBottom: '15px' }}>Your Meal Planner</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            This is your dashboard! Here you'll be able to:
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'left'
          }}>
            <li style={{ padding: '10px', background: 'white', margin: '10px 0', borderRadius: '6px' }}>
              📦 Upload and manage your grocery inventory
            </li>
            <li style={{ padding: '10px', background: 'white', margin: '10px 0', borderRadius: '6px' }}>
              🍽️ Get personalized meal recommendations
            </li>
            <li style={{ padding: '10px', background: 'white', margin: '10px 0', borderRadius: '6px' }}>
              ⭐ Set your dietary preferences and restrictions
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
