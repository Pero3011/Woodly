"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AuthPage() {
  const router = useRouter();

  //States Declaration
  const [view, setView] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { refreshUser } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  //Functions
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
        await refreshUser();
        router.push("/");
        router.refresh();
        toast.success(`Signed Up Successfully`);
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(`${errorData?.message || "Wrong Credentials."}`);
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
        await refreshUser();
        router.push("/");
        router.refresh();
        console.log(response);
        toast.success(`Signed In Successfully`);
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(`${errorData?.message || "Wrong Credentials."}`);
      }
    } catch (error) {
      alert("Network error. Please check your connection.");
    }
  };

  // Small helper for staggered entrance transitions, all pure Tailwind utilities.
  const enter = (delayMs: number) =>
    `transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
      mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`;

  return (
    <main className="flex h-screen w-full bg-[#fff8f3] font-['Public_Sans',sans-serif] text-[#211a11] antialiased overflow-hidden">
      {/* Left Side: Visual Branding */}
      <section className="hidden lg:flex w-1/2 relative bg-[#6b4226] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#6b4226]/40 z-10" />
          <div className="w-full h-full bg-cover bg-center scale-105 animate-[pulse_10s_ease-in-out_infinite]" />
        </div>

        <div
          className={`relative z-20 text-center px-10 max-w-lg ${enter(100)}`}
          style={{ transitionDelay: mounted ? "100ms" : "0ms" }}
        >
          <h1 className="font-['Newsreader',serif] text-[48px] leading-14 font-semibold text-[#fff8f3] mb-4">
            From Forest to Fine Art
          </h1>
          <p className="text-[18px] leading-7 text-[#eee0d1] opacity-90">
            Celebrating the tactile beauty of raw timber and the precision of
            modern craftsmanship. Join our collective of curators and makers.
          </p>
          <div className="mt-16 flex justify-center gap-4">
            <div className="h-1 w-12 bg-[#f4ba96] rounded-full" />
            <div className="h-1 w-4 bg-[#fff8f3]/30 rounded-full" />
            <div className="h-1 w-4 bg-[#fff8f3]/30 rounded-full" />
          </div>
        </div>

        {/* Grain Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-[0.04] pointer-events-none z-30" />
      </section>

      {/* Right Side: Auth Form */}
      <section className="w-full lg:w-1/2 bg-[#fff8f3] flex flex-col items-center justify-center px-6 md:px-20 overflow-y-auto relative">
        {/* Header Branding */}
        <div
          className={`absolute top-6 left-6 lg:left-20 flex items-center gap-2 ${enter(
            0,
          )}`}
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5gqwYgGxetjPrxQQhMtNAhZmkXln3VbdKTtXiR6F5gx9EY9Ng0mK3p20dkjibjka5oZHjs-7NyQiQOR6oXJsFpPzZTxDSM-H5M30kzhxpbzClcwM3mDD6_PGHTJuCBm9tURPiHFQWbI3HjaNRFE4APkioWniBpd89GDVD4GeMQBa_jqta3-HqfUzvUiEZEuNzOPr5YF8MDyl4MsQRZ6fH0AHmKXCv_Asrq7mk3NHJi3JHAsnPPSPSatnIIpWxfPZJGw"
            alt="Woodly Logo"
            className="h-6 w-auto object-contain"
          />
          <span className="px-2 py-1 bg-[#f4e6d6] rounded text-xs font-semibold text-[#51443d] uppercase tracking-widest border border-[#d5c3b9]">
            Admin Portal
          </span>
        </div>

        <div
          className={`w-full max-w-md py-16 ${enter(150)}`}
          style={{ transitionDelay: mounted ? "150ms" : "0ms" }}
        >
          {view === "signin" ? (
            /* Sign In Form */
            <div className="transition-all duration-300 ease-in-out">
              <div className="mb-8">
                <h2 className="font-['Newsreader',serif] text-[32px] leading-10 font-medium text-[#502c12] mb-1">
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
                    className="w-full px-6 py-3.5 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all shadow-[inset_0_2px_4px_0_rgba(46,29,18,0.06)] text-sm"
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
                  <div className="flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-6 py-3.5 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all shadow-[inset_0_2px_4px_0_rgba(46,29,18,0.06)] text-sm"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <Eye size={20} />
                      ) : (
                        <EyeClosed size={20} />
                      )}
                    </button>
                  </div>
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
                  className="w-full py-4 px-6 bg-[#6b4226] text-white border border-transparent rounded-lg text-sm font-semibold shadow-[0_16px_32px_-8px_rgba(46,29,18,0.12)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 mt-2"
                >
                  Sign In to Portal
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#d5c3b9]" />
                <span className="text-xs text-[#51443d]">or continue with</span>
                <div className="h-px flex-1 bg-[#d5c3b9]" />
              </div>

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
                <h2 className="font-['Newsreader',serif] text-[32px] leading-10 font-medium text-[#502c12] mb-1">
                  Join the Collective
                </h2>
                <p className="text-[16px] text-[#51443d]">
                  Start your journey from forest to masterpiece.
                </p>
              </div>

              <form className="space-y-3.5" onSubmit={handleSignUpSubmit}>
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-[#211a11]">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-3 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all shadow-[inset_0_2px_4px_0_rgba(46,29,18,0.06)] text-sm"
                  />
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
                    className="w-full px-6 py-3 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all shadow-[inset_0_2px_4px_0_rgba(46,29,18,0.06)] text-sm"
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
                    className="w-full px-6 py-3 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all shadow-[inset_0_2px_4px_0_rgba(46,29,18,0.06)] text-sm"
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
                    className="w-full px-6 py-3 bg-[#fff1e3] border border-[#d5c3b9] rounded-lg focus:ring-2 focus:ring-[#6b4226] focus:border-[#6b4226] outline-none transition-all shadow-[inset_0_2px_4px_0_rgba(46,29,18,0.06)] text-sm"
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
                  className="w-full py-3.5 px-6 bg-[#6b4226] text-white border border-transparent rounded-lg text-sm font-semibold shadow-[0_16px_32px_-8px_rgba(46,29,18,0.12)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                >
                  Create Professional Account
                </button>
              </form>

              {/* Divider */}
              <div className="my-5 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#d5c3b9]" />
                <span className="text-xs text-[#51443d]">or continue with</span>
                <div className="h-px flex-1 bg-[#d5c3b9]" />
              </div>

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
        <footer
          className={`absolute bottom-6 text-center px-10 ${enter(200)}`}
          style={{ transitionDelay: mounted ? "200ms" : "0ms" }}
        >
          <p className="text-xs text-[#51443d]/60">
            © 2024 Woodly Artisans. Digital Craftsmanship.
          </p>
        </footer>

        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-[0.02] pointer-events-none z-0" />
      </section>
    </main>
  );
}
