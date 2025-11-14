import { getCurrentUser } from '@/lib/auth';
import ChatInterface from '@/components/ChatInterface';
import LoginButton from '@/components/LoginButton';
import SyncButton from '@/components/SyncButton';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Health Assistant
            </h1>
            <p className="text-gray-600">
              Powered by Oura Ring and Claude AI
            </p>
          </div>

          <div className="mb-8">
            <svg
              className="w-24 h-24 mx-auto text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>

          <p className="text-gray-700 mb-6">
            Get personalized health insights and visualizations from your Oura
            Ring data using advanced AI analysis.
          </p>

          <LoginButton />

          <div className="mt-6 text-sm text-gray-500">
            <p>Connect your Oura account to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Health Assistant
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user.email}
              </p>
            </div>
            <div className="flex gap-3">
              <SyncButton />
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ask me about your health data
          </h2>
          <ChatInterface />
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            What you can ask:
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Sleep Analysis</h4>
              <p className="text-sm text-blue-700">
                &quot;How has my sleep quality been this week?&quot;
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Activity Trends</h4>
              <p className="text-sm text-green-700">
                &quot;Show me my activity patterns&quot;
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Readiness Insights</h4>
              <p className="text-sm text-purple-700">
                &quot;What&apos;s affecting my readiness score?&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
