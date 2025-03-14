"use client";

import { useState } from "react";

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    feedback: "",
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      alert("Feedback sent successfully!");
      setIsOpen(false);
      setFormData({ name: "", mobile: "", feedback: "" });
    } else {
      alert("Error sending feedback. Try again later.");
    }
  };

  return (
    <footer className="py-8 mt-10 w-4/5 mx-auto flex flex-col md:flex-row items-center justify-between text-center md:text-left border-t border-gray-700">
      <div
        onClick={scrollToTop}
        className="cursor-pointer flex flex-col items-center md:items-start"
      >
        <h1 className="text-white text-3xl font-extrabold">Fitnum</h1>
        <p className="text-gray-400 text-base font-medium mt-1">
          Track your calories in seconds
        </p>
      </div>
      <div className="flex flex-col items-center md:items-end">
        <button
          onClick={() => setIsOpen(true)}
          className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition duration-300 cursor-pointer"
        >
          Share Feedback
        </button>
        <p className="text-sm text-gray-400 mt-2">
          &copy; {new Date().getFullYear()} Fitnum. All rights reserved.
        </p>
      </div>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Share Your Feedback
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="p-3 border rounded-md outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-600 text-gray-900"
                required
              />
              <input
                type="tel"
                name="mobile"
                placeholder="Your Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="p-3 border rounded-md outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-600 text-gray-900"
                required
              />
              <textarea
                name="feedback"
                placeholder="Your Feedback"
                value={formData.feedback}
                onChange={handleChange}
                className="p-3 border rounded-md outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-600 text-gray-900"
                required
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg shadow-md transition duration-300 cursor-pointer"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-red-500 hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
