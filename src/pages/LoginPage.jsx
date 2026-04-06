import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Target,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Users,
  Code,
  ClipboardCheck,
  Crown,
  Bug,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  {
    id: "product_owner",
    title: "Product Owner",
    description:
      "Define product vision, manage backlog, and prioritize features",
    icon: Crown,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
  {
    id: "scrum_master",
    title: "Scrum Master",
    description: "Facilitate ceremonies, remove blockers, and coach the team",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    id: "developer",
    title: "Developer",
    description: "Build features, write code, and collaborate on solutions",
    icon: Code,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-100",
    textColor: "text-green-600",
  },
  {
    id: "qa_engineer",
    title: "QA Engineer",
    description: "Test features, report bugs, and ensure quality standards",
    icon: Bug,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
  },
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signupStep, setSignupStep] = useState(1); // 1: credentials, 2: role selection
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "",
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email) {
      setError("Please enter your email");
      return;
    }

    if (isSignUp) {
      // Move to role selection step
      setSignupStep(2);
    } else {
      try {
        const result = login(formData.email);
        if (result.success) {
          navigate("/dashboard");
        } else {
          setError(result.error || "Login failed. Please try again.");
        }
      } catch {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const handleRoleSelect = (roleId) => {
    setFormData({ ...formData, role: roleId });
  };

  const handleSignupComplete = () => {
    if (!formData.role) {
      setError("Please select your role");
      return;
    }

    try {
      signup(formData.email, formData.name, formData.role);
      navigate("/dashboard");
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  const handleBackToCredentials = () => {
    setSignupStep(1);
    setError("");
  };

  const handleChange = (e) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 mb-8 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gradient">AgileWheel</span>
          </Link>

          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Welcome to the
            <br />
            <span className="text-gradient">Future of Agile</span>
          </h1>

          <p className="text-xl text-slate-600 mb-8">
            Join thousands of teams who've transformed their development
            workflow with our interactive agile wheel.
          </p>

          <div className="space-y-4">
            {[
              "Real-time collaboration with your team",
              "Visual sprint tracking and planning",
              "Seamless integration with your tools",
              "Enterprise-grade security",
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">
                AgileWheel
              </span>
            </Link>
          </div>

          {/* Step indicator for signup */}
          {isSignUp && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${signupStep >= 1 ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-500"}`}
              >
                1
              </div>
              <div
                className={`w-12 h-1 ${signupStep >= 2 ? "bg-primary-600" : "bg-slate-200"}`}
              />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${signupStep >= 2 ? "bg-primary-600 text-white" : "bg-slate-200 text-slate-500"}`}
              >
                2
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {isSignUp
                ? signupStep === 1
                  ? "Create Account"
                  : "Select Your Role"
                : "Welcome Back"}
            </h2>
            <p className="text-slate-600">
              {isSignUp
                ? signupStep === 1
                  ? "Start your 14-day free trial today"
                  : "Choose the role that best describes you"
                : "Sign in to continue to AgileWheel"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Role Selection Step */}
          {isSignUp && signupStep === 2 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {ROLES.map((role) => {
                  const IconComponent = role.icon;
                  const isSelected = formData.role === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        isSelected
                          ? "border-primary-600 bg-primary-50 shadow-md"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSelected ? "bg-gradient-to-br " + role.color : role.bgColor}`}
                        >
                          <IconComponent
                            className={`w-6 h-6 ${isSelected ? "text-white" : role.textColor}`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${isSelected ? "text-primary-700" : "text-slate-900"}`}
                          >
                            {role.title}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {role.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleBackToCredentials}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSignupComplete}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Complete Signup
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 border-2 border-slate-300 rounded-lg px-4 py-3 hover:border-primary-600 hover:bg-slate-50 transition-all duration-300 group"
                >
                  <Globe className="w-5 h-5 text-slate-600 group-hover:text-primary-600" />
                  <span className="font-semibold text-slate-700 group-hover:text-primary-600">
                    Continue with Google
                  </span>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 border-2 border-slate-300 rounded-lg px-4 py-3 hover:border-primary-600 hover:bg-slate-50 transition-all duration-300 group"
                >
                  <Globe className="w-5 h-5 text-slate-600 group-hover:text-primary-600" />
                  <span className="font-semibold text-slate-700 group-hover:text-primary-600">
                    Continue with GitHub
                  </span>
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary-600 focus:outline-none transition-colors"
                      placeholder="John Doe"
                      required={isSignUp}
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary-600 focus:outline-none transition-colors"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-11 pr-12 py-3 border-2 border-slate-300 rounded-lg focus:border-primary-600 focus:outline-none transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {!isSignUp && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-slate-600">
                        Remember me
                      </span>
                    </label>
                    <a
                      href="#"
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                    >
                      Forgot password?
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  {isSignUp ? "Continue" : "Sign In"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-slate-600">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setSignupStep(1);
                      setFormData({ ...formData, role: "" });
                    }}
                    className="font-semibold text-primary-600 hover:text-primary-700"
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>

              {isSignUp && signupStep === 1 && (
                <p className="mt-6 text-xs text-center text-slate-500">
                  By signing up, you agree to our{" "}
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Privacy Policy
                  </a>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
