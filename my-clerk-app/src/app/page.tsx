"use client";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const handleWatchDemo = () => {
    window.open('/demo', '_blank', 'width=1400,height=900');
  };

  const handleLaunchDashboard = () => {
    window.location.href = '/dashboard/manager';
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-v2.png"
              alt="Atlas AI Hub Logo"
              width={120}
              height={120}
              className="h-20 w-auto"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleWatchDemo}
              className="px-6 py-2 border-2 border-[#065A82] text-[#065A82] rounded-lg font-semibold hover:bg-[#065A82] hover:text-white transition-colors"
            >
              Watch Demo
            </button>
            <button
              onClick={handleLaunchDashboard}
              className="px-6 py-2 bg-[#F96167] text-white rounded-lg font-semibold hover:bg-[#E84C56] transition-colors shadow-lg"
            >
              Launch Dashboard →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full pt-32 pb-20 px-6 overflow-hidden bg-gradient-to-br from-[#1E2761] via-[#065A82] to-[#0a3f52]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Control Your AI<br />
              <span className="bg-gradient-to-r from-[#F96167] to-[#FF6B7A] bg-clip-text text-transparent">Enterprise</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/85 mb-8 max-w-xl">
              Unified governance, cost control, and adoption tracking for AI Managers, CFOs, and Employees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleWatchDemo}
                className="px-10 py-4 bg-[#F96167] text-white font-bold rounded-lg text-lg transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
              >
                Demo
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="z-10">
                <Image
                  src="/logo-v2.png"
                  alt="Atlas AI Hub Logo"
                  width={500}
                  height={500}
                  className="h-[500px] w-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Personas Problem Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-[#1E2761] mb-6">
            Built for Every Role
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Atlas solves the critical challenges across your entire AI organization
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <PersonaCard
            title="AI Manager"
            icon="🛡️"
            color="from-[#065A82] to-[#0a3f52]"
            problems={[
              "No unified policy enforcement",
              "Violations go undetected",
              "Can't measure governance ROI"
            ]}
            solutions={[
              "Policy rule evaluation engine",
              "Real-time violation detection",
              "Audit trail for compliance"
            ]}
          />
          <PersonaCard
            title="CFO"
            icon="💰"
            color="from-[#1E2761] to-[#142047]"
            problems={[
              "AI costs buried in budgets",
              "No ROI tracking",
              "Month-to-month surprises"
            ]}
            solutions={[
              "Unified spend dashboard",
              "Cost attribution by team",
              "Budget enforcement & alerts"
            ]}
          />
          <PersonaCard
            title="Employees"
            icon="🚀"
            color="from-[#F96167] to-[#E84C56]"
            problems={[
              "Duplicate tool building",
              "No discovery mechanism",
              "Can't track impact"
            ]}
            solutions={[
              "Centralized tool gallery",
              "Agent builder",
              "Knowledge sharing platform"
            ]}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#F5F7FA] to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-[#1E2761] mb-20 text-center">
            Powerful Features, Simple Interface
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="📋"
              title="Model Registry"
              description="Central catalog of all AI models with ownership, versions, and deployment tracking"
            />
            <FeatureCard
              icon="⚖️"
              title="Policy Engine"
              description="Create and enforce governance policies with real-time violation detection"
            />
            <FeatureCard
              icon="💰"
              title="Cost Dashboard"
              description="Aggregate spend across vendors and allocate costs to specific teams"
            />
            <FeatureCard
              icon="🔍"
              title="Violation Tracking"
              description="Monitor policy breaches with severity levels and remediation workflows"
            />
            <FeatureCard
              icon="📚"
              title="Knowledge Management"
              description="Distribute RAG resources and documentation to AI models"
            />
            <FeatureCard
              icon="🤖"
              title="Agent Builder"
              description="No-code platform for creating and deploying AI agents"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#1E2761]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Control Your AI Enterprise?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            See Atlas AI Hub in action with an interactive live demo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleWatchDemo}
              className="px-12 py-4 bg-[#F96167] text-white font-bold rounded-lg text-lg hover:bg-[#E84C56] transition-colors shadow-xl"
            >
              Launch Demo →
            </button>
            <button
              className="px-12 py-4 border-2 border-white text-white font-bold rounded-lg text-lg hover:bg-white/10 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

function PersonaCard({
  title,
  icon,
  color,
  problems,
  solutions
}: {
  title: string
  icon: string
  color: string
  problems: string[]
  solutions: string[]
}) {
  const [showSolutions, setShowSolutions] = useState(false);

  return (
    <div className={`relative p-8 bg-gradient-to-br ${color} rounded-xl overflow-hidden transition-all hover:shadow-xl cursor-pointer group`}
      onClick={() => setShowSolutions(!showSolutions)}
    >
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>

        {!showSolutions ? (
          <div>
            <p className="text-white/70 text-sm font-semibold mb-4">Problems:</p>
            <ul className="space-y-3">
              {problems.map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-white/90">
                  <span className="text-[#F96167] font-bold flex-shrink-0">✕</span>
                  <span className="text-sm">{p}</span>
                </li>
              ))}
            </ul>
            <p className="text-white/60 text-xs mt-6 italic">Click to see solutions</p>
          </div>
        ) : (
          <div>
            <p className="text-white/70 text-sm font-semibold mb-4">Solutions:</p>
            <ul className="space-y-3">
              {solutions.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-white/90">
                  <span className="text-[#65F967] font-bold flex-shrink-0">✓</span>
                  <span className="text-sm">{s}</span>
                </li>
              ))}
            </ul>
            <p className="text-white/60 text-xs mt-6 italic">Click to see problems</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="p-8 bg-white rounded-xl border border-gray-200 hover:border-[#065A82] hover:shadow-lg transition-all group">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold text-[#1E2761] mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}


