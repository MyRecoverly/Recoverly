// path: src/components/Account.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider";

/**
 * Hardened Account page.
 * - Uses .maybeSingle() to avoid hard throws when RLS hides rows.
 * - Shows actionable errors when mapping/public.users row is missing.
 * - Defensive guards for user/session timing.
 */
const Account = () => {
  const { user } = useAuth();

  const [clientId, setClientId] = useState(null);
  const [businessName, setBusinessName] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");

  // Load mapping (users -> client_id) and client details
  useEffect(() => {
    let cancelled = false;

    async function loadAccountData() {
      if (!user) {
        // No session yet; render a gentle prompt instead of throwing.
        if (!cancelled) setLoading(false);
        return;
      }

      setLoading(true);
      setProfileError("");
      setProfileMessage("");

      try {
        // 1) Find client_id for this auth user
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("client_id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (userError) {
          // Likely RLS/policy error — surface message
          throw new Error(`User query failed: ${userError.message}`);
        }

        if (!userData?.client_id) {
          // Most common: missing mapping row or RLS hiding it
          throw new Error(
            "No user mapping found in public.users for this account. Please ensure a row exists with auth_user_id = your auth UUID and a valid client_id."
          );
        }

        if (cancelled) return;
        setClientId(userData.client_id);

        // 2) Load client profile (business name)
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("name")
          .eq("id", userData.client_id)
          .maybeSingle();

        if (clientError) {
          throw new Error(`Client query failed: ${clientError.message}`);
        }

        if (!clientData) {
          // Client row missing or hidden by RLS
          throw new Error(
            "Client not found or not accessible. Check that a clients row exists for this client_id and RLS policies allow SELECT."
          );
        }

        if (cancelled) return;
        setBusinessName(clientData.name || "");
      } catch (err) {
        console.error("Account data loading error:", err);
        if (!cancelled)
          setProfileError(
            err?.message || "Failed to load account information."
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAccountData();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const reload = () => {
    // Simple trigger to re-run the effect
    setLoading(true);
    setTimeout(() => setLoading(false), 0);
  };

  // Update business name
  const updateProfile = async () => {
    if (!user || !clientId) return;
    const nextName = (businessName || "").trim();
    if (!nextName) {
      setProfileError("Business name cannot be empty.");
      return;
    }

    setSaving(true);
    setProfileMessage("");
    setProfileError("");

    try {
      const { error } = await supabase
        .from("clients")
        .update({ name: nextName })
        .eq("id", clientId);

      if (error) throw error;

      setProfileMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileError(
        error?.message || "Error updating profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (!newPassword) {
      setPasswordError("New password cannot be empty.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match!");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) setPasswordError(error.message);
      else {
        setPasswordMessage("Password updated successfully!");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (err) {
      setPasswordError("Error changing password. Please try again.");
    }
  };

  // Change email
  const changeEmail = async (e) => {
    e.preventDefault();
    setEmailMessage("");
    setEmailError("");

    if (!newEmail) {
      setEmailError("Email cannot be empty.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) setEmailError(error.message);
      else {
        setEmailMessage("Confirmation email sent. Please check your inbox!");
        setNewEmail("");
      }
    } catch (err) {
      setEmailError("Error changing email. Please try again.");
    }
  };

  if (loading) {
    return <p className="p-6 text-center">Loading your account...</p>;
  }

  if (!user) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Account</h2>
        <p className="text-gray-600">Please log in to view your account.</p>
      </div>
    );
  }

  const lastLogin = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : "Not available";

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Account Information
      </h2>
      <p className="text-gray-600">
        View and update your personal and account details.
      </p>

      {/* Feedback (profile) */}
      {profileMessage && (
        <div className="bg-green-100 text-green-700 px-4 py-2 mb-4 rounded">
          {profileMessage}
        </div>
      )}
      {profileError && (
        <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">
          <div className="flex items-start justify-between">
            <span>{profileError}</span>
            <button
              onClick={reload}
              className="ml-4 text-sm text-blue-700 underline"
              title="Retry"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Business name */}
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-700 mb-3">User Profile</h3>
        <p className="text-gray-600 mb-4">
          <strong>Current Email:</strong> {user?.email || "N/A"}
        </p>

        <div className="mb-4">
          <label
            htmlFor="business-name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Business name
          </label>
          <input
            type="text"
            id="business-name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g., Your Business Name"
          />
        </div>

        <button
          onClick={updateProfile}
          disabled={saving || !clientId}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </div>

      {/* Email Change */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Change Email</h3>

        {emailMessage && (
          <div className="bg-green-100 text-green-700 px-4 py-2 mb-4 rounded">
            {emailMessage}
          </div>
        )}
        {emailError && (
          <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">
            {emailError}
          </div>
        )}

        <form onSubmit={changeEmail}>
          <label
            htmlFor="new-email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            New Email Address
          </label>
          <input
            type="email"
            id="new-email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter new email"
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Change Email
          </button>
        </form>
      </div>

      {/* Password Change */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-700 mb-3">
          Change Password
        </h3>

        {passwordMessage && (
          <div className="bg-green-100 text-green-700 px-4 py-2 mb-4 rounded">
            {passwordMessage}
          </div>
        )}
        {passwordError && (
          <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">
            {passwordError}
          </div>
        )}

        <form onSubmit={changePassword}>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            New password
          </label>
          <input
            type="password"
            id="new-password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />

          <label
            htmlFor="confirm-new-password"
            className="block text-sm font-medium text-gray-700 mt-4 mb-2"
          >
            Confirm new password
          </label>
          <input
            type="password"
            id="confirm-new-password"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Confirm new password"
          />

          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Change Password
          </button>
        </form>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Login
          </label>
          <p className="text-gray-600 p-2 border border-gray-200 rounded-md bg-gray-50">
            {lastLogin}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Account;
