'use client';

export default function LoginButton() {
  const handleLogin = () => {
    window.location.href = '/api/auth/oura';
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
    >
      Connect with Oura
    </button>
  );
}
