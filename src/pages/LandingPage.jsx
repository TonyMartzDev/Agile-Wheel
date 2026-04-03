import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import AgileWheelPreview from "../components/AgileWheelPreview";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">
                AgileWheel
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-slate-700 hover:text-primary-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-slate-700 hover:text-primary-600 transition-colors"
              >
                Benefits
              </a>
              <a
                href="#pricing"
                className="text-slate-700 hover:text-primary-600 transition-colors"
              >
                Pricing
              </a>
              <Link
                to="/login"
                className="text-slate-700 hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Agile Development,
              <br />
              <span className="text-gradient">Beautifully Simplified</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto">
              The interactive agile wheel that transforms how development teams
              collaborate, track progress, and deliver exceptional software.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/login"
                className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-primary-600 hover:text-primary-600 transition-all duration-300">
                Watch Demo
              </button>
            </div>
            <p className="text-slate-500 mt-4">
              No credit card required • 14-day free trial
            </p>
          </div>

          {/* Interactive Agile Wheel */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
              <div
                className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-8"
                style={{ minHeight: "700px" }}
              >
                <AgileWheelPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need to{" "}
              <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Built for modern teams who demand efficiency, clarity, and results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Interactive Agile Wheel",
                description:
                  "Visualize your entire sprint cycle with our intuitive wheel interface. Click through stages seamlessly.",
              },
              {
                icon: Users,
                title: "Real-Time Collaboration",
                description:
                  "Keep your entire team synchronized with live updates and instant notifications.",
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                description:
                  "Monitor velocity, burndown charts, and team performance with beautiful analytics.",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Built with modern technology for instant load times and smooth interactions.",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description:
                  "Bank-level encryption and SOC 2 compliance to keep your data safe.",
              },
              {
                icon: Clock,
                title: "Time Tracking",
                description:
                  "Automatic time tracking and reporting to understand where effort is spent.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-xl border border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-20 bg-gradient-to-br from-primary-600 to-blue-600"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Teams Choose AgileWheel
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of teams who've transformed their workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "50% Faster Sprint Planning",
                description:
                  "Our intuitive interface cuts planning time in half, letting you focus on building great software.",
              },
              {
                title: "Complete Visibility",
                description:
                  "Everyone knows exactly what's happening, what's next, and where bottlenecks exist.",
              },
              {
                title: "Seamless Integration",
                description:
                  "Works with your existing tools: Jira, GitHub, Slack, and more. No disruption to your workflow.",
              },
              {
                title: "Better Team Morale",
                description:
                  "Clear goals and visible progress keep teams motivated and aligned on what matters.",
              },
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-8 h-8 text-green-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-blue-100">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join leading teams who've already made the switch to AgileWheel
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-slate-500 mt-4">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">AgileWheel</span>
              </div>
              <p className="text-sm">
                Making agile development beautiful and efficient.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 AgileWheel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
