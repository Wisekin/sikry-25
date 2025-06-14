"use client";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user")
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => setUser(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user || user.error) return <div className="p-8 text-red-500">Unauthorized or not logged in.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div>Name: {user.name}</div>
      <div>Email: {user.email}</div>
    </div>
  );
}
