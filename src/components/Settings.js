import React, { useState, useEffect } from "react";
import { readSettings, updateSettings } from "../api/settings"; // Your new Supabase helpers
import { useAuth } from "../auth/AuthProvider";

const Settings = () => {
  const { user } = useAuth();

  const [reportFrequency, setReportFrequency] = useState("monthly");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [reportEmail, setReportEmail] = useState("");

  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [replyToEmail, setReplyToEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load settings for the current client
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await readSettings();
        if (data) {
          setReportFrequency(data.reportFrequency || "monthly");
          setIncludeCharts(data.includeCharts ?? true);
          setReportEmail(data.reportEmail || "");
          setSenderEmail(data.senderEmail || "");
          setSenderName(data.senderName || "");
          setReplyToEmail(data.replyToEmail || "");
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("Failed to load settings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  // Save settings to Supabase, with a guard against double-clicks
  const saveSettings = async () => {
    // New safety check to prevent double-saving
    if (!user || saving) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateSettings({
        reportFrequency,
        includeCharts,
        reportEmail,
        senderEmail,
        senderName,
        replyToEmail,
      });

      setMessage("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      // Use the error message from the API helper if available
      setError(err.message || "Error saving settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-center">Loading your settings...</p>;
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h2>
      <p className="text-gray-600">
        Manage your application settings here. You can customize preferences,
        notifications, and integrations.
      </p>

      {/* Feedback Messages */}
      {message && (
        <div className="bg-green-100 text-green-700 px-4 py-2 my-4 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 my-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">
          Reporting Preferences
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Frequency
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="report-frequency"
                value="weekly"
                checked={reportFrequency === "weekly"}
                onChange={() => setReportFrequency("weekly")}
              />
              <span className="ml-2 text-gray-700">Weekly</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="report-frequency"
                value="monthly"
                checked={reportFrequency === "monthly"}
                onChange={() => setReportFrequency("monthly")}
              />
              <span className="ml-2 text-gray-700">Monthly</span>
            </label>
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="include-charts"
            className="form-checkbox text-blue-600 h-5 w-5 rounded focus:ring-blue-500"
            checked={includeCharts}
            onChange={(e) => setIncludeCharts(e.target.checked)}
          />
          <label
            htmlFor="include-charts"
            className="ml-2 text-sm font-medium text-gray-700"
          >
            Include charts in the reporting
          </label>
        </div>

        <div className="mb-4">
          <label
            htmlFor="report-email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Send report to email address
          </label>
          <input
            type="email"
            id="report-email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            value={reportEmail}
            onChange={(e) => setReportEmail(e.target.value)}
            placeholder="e.g., reports@example.com"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">
          Email Settings
        </h3>

        <div className="mb-4">
          <label
            htmlFor="sender-email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Sender email
          </label>
          <input
            type="email"
            id="sender-email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="e.g., info@yourcompany.com"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="sender-name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Sender name
          </label>
          <input
            type="text"
            id="sender-name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="e.g., Your Company Name"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="reply-to-email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Reply-to email
          </label>
          <input
            type="email"
            id="reply-to-email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            value={replyToEmail}
            onChange={(e) => setReplyToEmail(e.target.value)}
            placeholder="e.g., support@yourcompany.com"
          />
        </div>
      </div>

      <button
        onClick={saveSettings}
        disabled={saving}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
};

export default Settings;
