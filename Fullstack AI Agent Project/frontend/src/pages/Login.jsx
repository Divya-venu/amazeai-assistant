import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Or{' '}
          <Link to="/signup" className="font-medium text-indigo-500 hover:text-indigo-400 transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-800 text-center text-slate-400">
          <p>Login functionality coming soon.</p>
          <p className="mt-4">
            <Link to="/dashboard" className="text-indigo-500 hover:text-indigo-400 underline">
              Bypass to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
