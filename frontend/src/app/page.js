"use client";

import { useState } from "react";
import Image from "next/image";

export default function ContactFormPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    file: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setShowPopup(true);
    }, 5000); // 5 seconds loader
  };

  return (
    <div className="relative w-full h-[100vh] flex flex-row bg-cover bg-center bg-[url('/home-bg.svg')] items-center justify-between">
      {/* Popup */}
      {showPopup && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">File Uploaded Successfully!</h2>
            <p className="text-gray-700 mb-4">API KEY - Alkfm3847SHf849</p>
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
  
      {/* Left - Text + Form */}
      <div className="flex-1 flex flex-col h-full text-white px-8">
        <div className="mt-12 text-4xl font-poppins space-y-2 leading-[1.1] h-[35vh]">
          <span className="block">Super Duper</span>
          <span className="block">Crazy Intelligent</span>
          <span className="block">Calling Machine</span>
          <span className="block">Error 422 - Unprocessible Entity</span>

        </div>
  
        <div className="bg-white rounded-lg shadow-md p-6 mt-8 text-black">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-slate-700 mb-1">Upload File</label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleChange}
                required
                className="w-full text-sm text-black"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-md text-white font-semibold ${
                isSubmitting ? "bg-purple-300 cursor-wait" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isSubmitting ? "Processing..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
  
      {/* Right - Image */}
      <div className="flex-1 flex items-center justify-center h-[90vh] relative">
        <Image src="/hero-v.png" alt="Hero" fill className="object-contain" />
      </div>
    </div>
  );
}