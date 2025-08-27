import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Account from "./components/Account";
import Login from "./components/Login";

import { useAuth } from "./auth/AuthProvider";
import { supabase } from "./supabaseClient";

const App = () => {
  const { user, loading } = useAuth(); // Get user and loading state from the AuthProvider
  const [activeSection, setActiveSection] = useState("home");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // State to control the login modal

  // Function to handle logout using Supabase
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setActiveSection("home");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  // Only allow navigation to dashboard/settings/account if logged in
  const handleSectionChange = (section) => {
    if (
      !user &&
      (section === "dashboard" ||
        section === "settings" ||
        section === "account")
    ) {
      setShowLoginModal(true);
    } else {
      setActiveSection(section);
    }
  };

  const renderContent = () => {
    // Pass the user's UID to components that need it
    const userId = user?.id || null;

    switch (activeSection) {
      case "home":
        return <Home />;
      case "dashboard":
        return <Dashboard userId={userId} />;
      case "settings":
        return <Settings userId={userId} />;
      case "account":
        return <Account userId={userId} />;
      default:
        return <Home />;
    }
  };

  // Show a loading state while Supabase is checking the session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f1f5f9]">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased bg-[#f1f5f9] min-h-screen flex text-gray-900">
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
      />
      <main className="flex-1 p-8 overflow-y-auto transition-all duration-300 ease-in-out">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {user ? `Welcome back, ${user.email} 👋` : "Welcome! 👋"}
          </h2>
          <div className="flex items-center space-x-2">
            <span
              className={`text-sm font-medium ${
                user ? "text-green-600" : "text-red-600"
              }`}
            >
              {user ? "Logged In" : "Not Logged In"}
            </span>
            {!user ? (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
              >
                Login
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </header>
        {renderContent()}
      </main>

      {/* Conditionally render the Login modal */}
      {showLoginModal && (
        <Login
          onClose={() => {
            setShowLoginModal(false);
            setActiveSection("home");
          }}
        />
      )}
    </div>
  );
};

export default App;
