import React from 'react';
import { 
  Users, 
  Target, 
  Zap, 
  Award, 
  FileText, 
  DollarSign 
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Users,
      title: 'Expert Peer Review',
      description: 'Connect with qualified reviewers in your field for constructive feedback that elevates your research quality.',
    },
    {
      icon: Target,
      title: 'Smart Journal Recommendation',
      description: 'AI-powered matching system suggests the best journals for your manuscript based on scope and impact factor.',
    },
    {
      icon: Zap,
      title: 'Fast-Track Review Option',
      description: 'Accelerated review process for time-sensitive research with guaranteed turnaround within 14 days.',
    },
    {
      icon: Award,
      title: 'Points & Rewards System',
      description: 'Earn points for reviewing articles and participating in the community. Redeem for publication support.',
    },
    {
      icon: FileText,
      title: 'Professional Formatting',
      description: 'Get expert assistance with manuscript formatting, citation styles, and adherence to journal guidelines.',
    },
    {
      icon: DollarSign,
      title: 'Publication Cost Support',
      description: 'High-earning users can redeem points for APC (Article Processing Charge) coverage on partner journals.',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-[#F7FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1A365D] mb-4">
            Why Choose Us
          </h2>
          <p className="text-lg text-[#2D3748] max-w-2xl mx-auto">
            Comprehensive tools and services designed to accelerate your research journey from manuscript to publication.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#319795]/30 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-[#319795]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#319795] transition-colors">
                <feature.icon className="w-7 h-7 text-[#319795] group-hover:text-white transition-colors" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[#1A365D] mb-3">
                {feature.title}
              </h3>
              <p className="text-[#2D3748] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
