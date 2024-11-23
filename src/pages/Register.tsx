import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-indigo-500" />
          <h2 className="mt-6 text-3xl font-bold">Create an account</h2>
          <p className="mt-2 text-gray-400">Start organizing your tasks today</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Full name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Create account
          </Button>

          <p className="text-center text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-500 hover:text-indigo-400">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}