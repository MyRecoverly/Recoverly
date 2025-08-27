import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

export default function AdminCreateClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createClient = async () => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Create their Firestore document with empty data
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        dashboardData: { message: "Welcome to your new dashboard!" },
        settings: { theme: "light" },
        accountInfo: { name: "", businessName: "" },
        createdAt: new Date(),
      });

      alert("Client account created successfully!");
    } catch (error) {
      console.error("Error creating client:", error.message);
    }
  };

  return (
    <div>
      <h2>Create New Client Account</h2>
      <input
        type="email"
        placeholder="Client Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Temp Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={createClient}>Create Client</button>
    </div>
  );
}
