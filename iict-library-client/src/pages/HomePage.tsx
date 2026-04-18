import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';

const HomePage = () => {
  return (
    <Card className="space-y-4 text-center">
      <h1 className="text-3xl font-bold text-dark-brown">IICT Library Management System</h1>
      <p className="text-warm-taupe">Welcome to the IICT Library portal.</p>
      <div className="flex justify-center gap-3">
        <Link to="/login" className="rounded-md bg-dark-brown px-4 py-2 text-sm font-medium text-white">
          Login
        </Link>
        <Link to="/register" className="rounded-md bg-sandy-beige px-4 py-2 text-sm font-medium text-dark-brown">
          Register
        </Link>
      </div>
    </Card>
  );
};

export default HomePage;
