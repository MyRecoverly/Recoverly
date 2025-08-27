import React from "react";

const Sidebar = ({
  isSidebarExpanded,
  setIsSidebarExpanded,
  activeSection,
  setActiveSection,
}) => (
  <aside
    className={`bg-gray-800 text-white p-6 flex flex-col rounded-r-xl shadow-lg transition-all duration-300 ease-in-out ${
      isSidebarExpanded ? "w-64" : "w-20 items-center"
    }`}
  >
    <div
      className={`flex items-center mb-8 ${
        isSidebarExpanded ? "" : "justify-center"
      }`}
    >
      <button
        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
        className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
      >
        <svg
          className="w-6 h-6 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>
      {isSidebarExpanded && (
        <h1 className="text-2xl font-bold ml-4">Recoverly</h1>
      )}
    </div>
    <nav className="flex-grow">
      <ul>
        <li className="mb-3">
          <button
            onClick={() => setActiveSection("home")}
            className={`flex items-center w-full py-2 px-4 rounded-lg text-left transition-colors duration-200 ${
              activeSection === "home"
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-gray-700 text-gray-300"
            } ${isSidebarExpanded ? "" : "justify-center px-2"}`}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6-4h4"
              ></path>
            </svg>
            {isSidebarExpanded && "Home"}
          </button>
        </li>
        <li className="mb-3">
          <button
            onClick={() => setActiveSection("dashboard")}
            className={`flex items-center w-full py-2 px-4 rounded-lg text-left transition-colors duration-200 ${
              activeSection === "dashboard"
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-gray-700 text-gray-300"
            } ${isSidebarExpanded ? "" : "justify-center px-2"}`}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              ></path>
            </svg>
            {isSidebarExpanded && "Dashboard"}
          </button>
        </li>
        <li className="mb-3">
          <button
            onClick={() => setActiveSection("settings")}
            className={`flex items-center w-full py-2 px-4 rounded-lg text-left transition-colors duration-200 ${
              activeSection === "settings"
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-gray-700 text-gray-300"
            } ${isSidebarExpanded ? "" : "justify-center px-2"}`}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.568.356 1.334.232 1.724-.065z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
            {isSidebarExpanded && "Settings"}
          </button>
        </li>
        <li className="mb-3">
          <button
            onClick={() => setActiveSection("account")}
            className={`flex items-center w-full py-2 px-4 rounded-lg text-left transition-colors duration-200 ${
              activeSection === "account"
                ? "bg-blue-600 text-white shadow-md"
                : "hover:bg-gray-700 text-gray-300"
            } ${isSidebarExpanded ? "" : "justify-center px-2"}`}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            {isSidebarExpanded && "Account"}
          </button>
        </li>
      </ul>
    </nav>
    <div
      className={`mt-auto pt-6 border-t border-gray-700 text-gray-400 text-sm ${
        isSidebarExpanded ? "" : "hidden"
      }`}
    >
      <p>&copy; 2025 Recoverly</p>
      <p>Version 1.0</p>
    </div>
  </aside>
);
export default Sidebar;
