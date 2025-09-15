"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
// import { AuthClient } from '@/lib/auth-client'

/**
 * SignUp component
 * Allows users to create a new account using API
 * @return {React.Component} - The SignUp component
 */
export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!firstName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (firstName.trim().length < 2) {
      setError("First name must be at least 2 characters long");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // Direct API call to signup endpoint
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: firstName.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const result = await response.json();

      if (result.success && result.data?.user) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(result.data.user));

        // Redirect to chat page
        router.push("/chat");
      } else {
        // Handle API error
        setError(
          result.message || "Failed to create account. Please try again."
        );
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white border-gray-200 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center text-gray-900">
          Sign Up
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          Create a new account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password (min. 6 characters)"
              required
              className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
              minLength={6}
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded border border-red-200">
              {error}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
