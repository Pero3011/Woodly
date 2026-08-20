"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [view, setView] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/signUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`User ${data.name || "account"} created successfully!`);

        router.push("/products/home");
      } else {
        const errorData = await response.json().catch(() => null);
        console.log(
          errorData?.message || "Something went wrong on the server.",
        );
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/signIn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        console.log(`User Logged in successfully!`);
        router.push("/products/home");
      } else {
        const errorData = await response.json().catch(() => null);
        console.log(
          errorData?.message || "Something went wrong on the server.",
        );
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    }
  };

  return (
    <>
      <style jsx global>{`
        .font-serif-display {
          font-family: "Newsreader", serif;
        }
        .font-sans-body {
          font-family: "Public Sans", sans-serif;
        }
        .wood-texture-overlay {
          background-image: url("https://www.transparenttextures.com/patterns/wood-pattern.png");
          opacity: 0.04;
          pointer-events: none;
        }
        .inner-shadow-inlay {
          box-shadow: inset 0 2px 4px 0 rgba(46, 29, 18, 0.06);
        }
        .plank-shadow {
          box-shadow: 0 16px 32px -8px rgba(46, 29, 18, 0.12);
        }
      `}</style>

      <main className="flex h-screen w-full bg-[#fff8f3] font-sans-body text-[#211a11] antialiased overflow-hidden">
        {/* Left Side: Visual Branding */}
        <section className="hidden lg:flex w-1/2 relative bg-[#6b4226] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#6b4226]/40 z-10"></div>
            <div className="w-full h-full bg-cover bg-center scale-105 animate-[pulse_10s_ease-in-out_infinite]"></div>
          </div>

          <div className="relative z-20 text-center px-10 max-w-lg">
            <h1 className="font-serif-display text-[48px] leading-14 font-semibold text-[#fff8f3] mb-4">
              From Forest to Fine Art
            </h1>
            <p className="text-[18px] leading-7 text-[#eee0d1] opacity-90">
              Celebrating the tactile beauty of raw timber and the precision of
              modern craftsmanship. Join our collective of curators and makers.
            </p>
            <div className="mt-16 flex justify-center gap-4">
              <div className="h-1 w-12 bg-[#f4ba96] rounded-full"></div>
              <div className="h-1 w-4 bg-[#fff8f3]/30 rounded-full"></div>
              <div className="h-1 w-4 bg-[#fff8f3]/30 rounded-full"></div>
            </div>
          </div>

          {/* Grain Overlay */}
          <div className="absolute inset-0 wood-texture-overlay z-30"></div>
        </section>

        {/* Right Side: Auth Form */}
        <section className="w-full lg:w-1/2 bg-[#fff8f3] flex flex-col items-center justify-center px-6 md:px-20 overflow-y-auto relative">
          {/* Header Branding */}
          <div className="absolute top-6 left-6 lg:left-20 flex items-center gap-2">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5gqwYgGxetjPrxQQhMtNAhZmkXln3VbdKTtXiR6F5gx9EY9Ng0mK3p20dkjibjka5oZHjs-7NyQiQOR6oXJsFpPzZTxDSM-H5M30kzhxpbzClcwM3mDD6_PGHTJuCBm9tURPiHFQWbI3HjaNRFE4APkioWniBpd89GDVD4GeMQBa_jqta3-HqfUzvUiEZEuNzOPr5YF8MDyl4MsQRZ6fH0AHmKXCv_Asrq7mk3NHJi3JHAsnPPSPSatnIIpWxfPZJGw"
              alt="Woodly Logo"
              className="h-6 w-auto object-contain"
            />
            <span className="px-2 py-1 bg-[#f4e6d6] rounded text-xs font-semibold text-[#51443d] uppercase tracking-widest border border-[#d5c3b9]">
              Admin Portal
            </span>
          </div>

          <div className="w-full max-w-md py-16">
            {view === "signin" ? (
              /* Sign In Form */
              <div className="transition-all duration-300 ease-in-out">
                <div className="mb-8">
                  <h2 className="font-serif-display text-[32px] leading-10 font-medium text-[#502c12] mb-1">
                    Welcome Back
                  </h2>
                  <p className="text-[16px] text-[#51443d]">
                    Please enter your details to access your studio.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSignInSubmit}>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-[#211a11]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="artisan@woodly.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-3.5 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all inner-shadow-inlay text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-semibold text-[#211a11]">
                        Password
                      </label>
                      <a
                        href="#"
                        className="text-xs text-[#6b4226] hover:underline"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-3.5 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all inner-shadow-inlay text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-5 h-5 rounded border-[#d5c3b9] text-[#502c12] focus:ring-[#502c12] cursor-pointer"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-[#51443d] cursor-pointer"
                    >
                      Keep me signed in
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 px-6 bg-[#6b4226] text-white border border-transparent rounded-lg text-sm font-semibold plank-shadow hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 mt-2"
                  >
                    Sign In to Portal
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[#d5c3b9]"></div>
                  <span className="text-xs text-[#51443d]">
                    or continue with
                  </span>
                  <div className="h-px flex-1 bg-[#d5c3b9]"></div>
                </div>

                {/* Google Button */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[#fff8f3] border border-[#d5c3b9] rounded-lg text-sm font-semibold hover:bg-[#eee0d1] transition-colors group"
                >
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV76CiIzeXNLTkmwSV-4AcyHuE6LrU1Ut5JDBsfensd4d7CyT8rG99kmZ2vZGSuMFbSXBdfb5ZXRl32veiwwvIfA9mE9A9zjvlE7F17LEl5se5AJDBSaRF1yGRVXe1qDhmjvwy0AI41B5XuhkS9cVhldQ5QlUOn7KP4b0j5HjO14Wlyw4DCSKzm6iGichKTpD76hvJ9BgdRTCNnCi51xyN_0rYQUC9cnaaeKbZu6Z8f_avkiRFo8Yi"
                    alt="Google"
                    className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all"
                  />
                  <span>Google Workspace</span>
                </button>

                <p className="mt-6 text-center text-sm text-[#51443d]">
                  New to Woodly?{" "}
                  <button
                    onClick={() => setView("signup")}
                    className="text-[#6b4226] font-semibold hover:underline ml-1"
                  >
                    Create an Account
                  </button>
                </p>
              </div>
            ) : (
              /* Sign Up Form */
              <div className="transition-all duration-300 ease-in-out">
                <div className="mb-6">
                  <h2 className="font-serif-display text-[32px] leading-10 font-medium text-[#502c12] mb-1">
                    Join the Collective
                  </h2>
                  <p className="text-[16px] text-[#51443d]">
                    Start your journey from forest to masterpiece.
                  </p>
                </div>

                <form className="space-y-3.5" onSubmit={handleSignUpSubmit}>
                  <div>
                    <div className="space-y-1">
                      <label className="block text-sm font-semibold text-[#211a11]">
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="John"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-6 py-3 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all inner-shadow-inlay text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-[#211a11]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="artisan@woodly.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-3 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all inner-shadow-inlay text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-[#211a11]">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-6 py-3 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all inner-shadow-inlay text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-[#211a11]">
                      Create Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-3 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all inner-shadow-inlay text-sm"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-5 h-5 rounded border-[#d5c3b9] text-[#502c12] focus:ring-[#502c12] cursor-pointer"
                    />
                    <label
                      htmlFor="terms"
                      className="text-xs text-[#51443d] leading-tight cursor-pointer"
                    >
                      I agree to the{" "}
                      <a href="#" className="underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="underline">
                        Privacy Policy
                      </a>{" "}
                      regarding my artisanal data.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 bg-[#6b4226] text-white border border-transparent rounded-lg text-sm font-semibold plank-shadow hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                  >
                    Create Professional Account
                  </button>
                </form>

                {/* Divider */}
                <div className="my-5 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[#d5c3b9]"></div>
                  <span className="text-xs text-[#51443d]">
                    or continue with
                  </span>
                  <div className="h-px flex-1 bg-[#d5c3b9]"></div>
                </div>

                {/* Google Button */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-[#fff8f3] border border-[#d5c3b9] rounded-lg text-sm font-semibold hover:bg-[#eee0d1] transition-colors group"
                >
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBV76CiIzeXNLTkmwSV-4AcyHuE6LrU1Ut5JDBsfensd4d7CyT8rG99kmZ2vZGSuMFbSXBdfb5ZXRl32veiwwvIfA9mE9A9zjvlE7F17LEl5se5AJDBSaRF1yGRVXe1qDhmjvwy0AI41B5XuhkS9cVhldQ5QlUOn7KP4b0j5HjO14Wlyw4DCSKzm6iGichKTpD76hvJ9BgdRTCNnCi51xyN_0rYQUC9cnaaeKbZu6Z8f_avkiRFo8Yi"
                    alt="Google"
                    className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all"
                  />
                  <span>Register with Google</span>
                </button>

                <p className="mt-5 text-center text-sm text-[#51443d]">
                  Already have an account?{" "}
                  <button
                    onClick={() => setView("signin")}
                    className="text-[#6b4226] font-semibold hover:underline ml-1"
                  >
                    Sign In Instead
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="absolute bottom-6 text-center px-10">
            <p className="text-xs text-[#51443d]/60">
              © 2024 Woodly Artisans. Digital Craftsmanship.
            </p>
          </footer>

          <div className="absolute inset-0 wood-texture-overlay z-0 opacity-[0.02]"></div>
        </section>
      </main>
    </>
  );
}
