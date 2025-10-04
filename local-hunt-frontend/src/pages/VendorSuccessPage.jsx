import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { 
  BookOpen, 
  TrendingUp, 
  Megaphone, 
  Award, 
  CheckCircle, 
  Download,
  Users,
  Star,
  ArrowRight,
  FileText,
  BarChart3,
  MessageCircle,
  Shield,
  Clock,
  Zap
} from 'lucide-react';
import '../styles/VendorSuccessHub.css';

const VendorSuccessHub = () => {
  const [activeSection, setActiveSection] = useState('setup-guide');

  const navigationTabs = [
    { id: 'setup-guide', label: 'Setup Guide', icon: <BookOpen size={20} /> },
    { id: 'business-growth', label: 'Growth Tips', icon: <TrendingUp size={20} /> },
    { id: 'marketing-toolkit', label: 'Marketing Toolkit', icon: <Megaphone size={20} /> },
    { id: 'success-stories', label: 'Success Stories', icon: <Award size={20} /> }
  ];

  // Setup Guide Steps
  const setupSteps = [
    {
      step: 1,
      title: 'Account Registration & Profile Setup',
      description: 'Create your vendor account and build a compelling business profile that attracts customers.',
      features: [
        'Complete business registration',
        'Upload professional photos',
        'Add detailed service descriptions',
        'Set up business hours and contact info'
      ]
    },
    {
      step: 2,
      title: 'Verification & Trust Building',
      description: 'Get verified to build customer trust and increase your visibility on the platform.',
      features: [
        'Government ID verification',
        'Business license validation',
        'Background check process',
        'Customer review system setup'
      ]
    },
    {
      step: 3,
      title: 'Service Catalog & Pricing',
      description: 'Set up your service offerings with clear pricing and detailed descriptions.',
      features: [
        'Create service packages',
        'Set competitive pricing',
        'Add service areas coverage',
        'Configure availability calendar'
      ]
    },
    {
      step: 4,
      title: 'Go Live & Customer Acquisition',
      description: 'Launch your business and start attracting customers through our platform.',
      features: [
        'Profile optimization tips',
        'Promotional strategies',
        'Customer engagement tools',
        'Performance tracking setup'
      ]
    }
  ];

  // Business Growth Tips
  const growthTips = [
    {
      icon: <Star size={32} />,
      title: 'Build Your Reputation',
      description: 'Establish trust and credibility to attract more customers.',
      tips: [
        'Encourage customer reviews and testimonials',
        'Respond promptly to all customer inquiries',
        'Maintain consistent service quality',
        'Showcase your certifications and experience'
      ]
    },
    {
      icon: <Users size={32} />,
      title: 'Customer Retention',
      description: 'Turn one-time customers into loyal, repeat clients.',
      tips: [
        'Implement loyalty programs and discounts',
        'Follow up after service completion',
        'Offer maintenance packages',
        'Provide exceptional customer service'
      ]
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Business Scaling',
      description: 'Grow your business and expand your service offerings.',
      tips: [
        'Hire and train additional staff',
        'Expand to new service areas',
        'Diversify your service portfolio',
        'Invest in better equipment and tools'
      ]
    }
  ];

  // Marketing Toolkit
  const marketingTools = [
    {
      icon: <FileText size={40} />,
      title: 'Business Profile Templates',
      description: 'Professional templates to create compelling business profiles that convert visitors into customers.',
      download: 'Download Templates'
    },
    {
      icon: <Megaphone size={40} />,
      title: 'Social Media Kit',
      description: 'Ready-to-use social media posts, banners, and content ideas to promote your business online.',
      download: 'Get Social Kit'
    },
    {
      icon: <MessageCircle size={40} />,
      title: 'Customer Communication Templates',
      description: 'Professional email and message templates for customer inquiries, follow-ups, and feedback requests.',
      download: 'Download Templates'
    },
    {
      icon: <Shield size={40} />,
      title: 'Trust Building Resources',
      description: 'Certification badges, verification guides, and trust-building materials for your business.',
      download: 'Get Resources'
    }
  ];

  // Success Stories
  const successStories = [
    {
      name: 'Raj Electric Works',
      owner: 'Raj Kumar',
      story: 'From a small local electrician to serving 50+ customers monthly across the city.',
      image: '/electrician-success.jpg',
      stats: {
        growth: '300%',
        customers: '500+',
        rating: '4.9'
      }
    },
    {
      name: 'Perfect Stitch Tailors',
      owner: 'Meena Sharma',
      story: 'Expanded from home-based tailoring to three store locations with 10 employees.',
      image: '/tailor-success.jpg',
      stats: {
        growth: '500%',
        customers: '2000+',
        rating: '4.8'
      }
    },
    {
      name: 'City Mobile Repair',
      owner: 'Sunil Patel',
      story: 'Started with one repair counter, now operating 5 service centers across the city.',
      image: '/mobile-repair-success.jpg',
      stats: {
        growth: '400%',
        customers: '3000+',
        rating: '4.7'
      }
    }
  ];

  return (
    <div className="vendor-success-hub">
      {/* Hero Section */}
      <section className="hub-hero">
        <Container>
          <div className="hero-content">
            <h1 className="hero-title">Vendor Success Hub</h1>
            <p className="hero-subtitle">
              Everything you need to start, grow, and succeed with your local business on Nearమీ. 
              Join thousands of successful vendors who have transformed their businesses.
            </p>
          </div>
        </Container>
      </section>

      {/* Navigation */}
      <section className="hub-navigation">
        <Container>
          <div className="nav-tabs">
            {navigationTabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeSection === tab.id ? 'active' : ''}`}
                onClick={() => setActiveSection(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </Container>
      </section>

      {/* Content Sections */}
      <section className="hub-content">
        <Container>
          {/* Setup Guide */}
          <div className={`content-section ${activeSection === 'setup-guide' ? 'active' : ''}`}>
            <h2 className="section-title">Vendor Setup Guide</h2>
            <p className="section-subtitle">
              Follow these simple steps to set up your business and start getting customers
            </p>
            
            <div className="guide-steps">
              {setupSteps.map(step => (
                <div key={step.step} className="guide-step">
                  <div className="step-number">{step.step}</div>
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <div className="step-features">
                      {step.features.map((feature, index) => (
                        <div key={index} className="step-feature">
                          <CheckCircle size={18} className="feature-icon" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Growth */}
          <div className={`content-section ${activeSection === 'business-growth' ? 'active' : ''}`}>
            <h2 className="section-title">Business Growth Strategies</h2>
            <p className="section-subtitle">
              Proven strategies to grow your customer base and increase your revenue
            </p>
            
            <div className="growth-grid">
              {growthTips.map((tip, index) => (
                <div key={index} className="growth-card">
                  <div className="growth-icon">
                    {tip.icon}
                  </div>
                  <h3>{tip.title}</h3>
                  <p>{tip.description}</p>
                  <ul className="tip-list">
                    {tip.tips.map((item, tipIndex) => (
                      <li key={tipIndex}>
                        <Zap size={16} className="tip-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing Toolkit */}
          <div className={`content-section ${activeSection === 'marketing-toolkit' ? 'active' : ''}`}>
            <h2 className="section-title">Marketing Toolkit</h2>
            <p className="section-subtitle">
              Free resources and tools to help you market your business effectively
            </p>
            
            <div className="toolkit-grid">
              {marketingTools.map((tool, index) => (
                <div key={index} className="toolkit-card">
                  <div className="toolkit-icon">
                    {tool.icon}
                  </div>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                  <a href="#" className="download-btn">
                    <Download size={18} className="me-2" />
                    {tool.download}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <div className={`content-section ${activeSection === 'success-stories' ? 'active' : ''}`}>
            <h2 className="section-title">Success Stories</h2>
            <p className="section-subtitle">
              Real vendors who transformed their businesses using Nearమీ platform
            </p>
            
            <div className="stories-grid">
              {successStories.map((story, index) => (
                <div key={index} className="story-card">
                  <img 
                    src={story.image} 
                    alt={story.name}
                    className="story-image"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/600x400/667eea/ffffff?text=Business+Success';
                    }}
                  />
                  <div className="story-content">
                    <h3>{story.name}</h3>
                    <span className="story-owner">By {story.owner}</span>
                    <p>{story.story}</p>
                    <div className="story-stats">
                      <div className="stat">
                        <span className="stat-value">{story.stats.growth}</span>
                        <span className="stat-label">Growth</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{story.stats.customers}</span>
                        <span className="stat-label">Customers</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{story.stats.rating}</span>
                        <span className="stat-label">Rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="hub-cta">
        <Container>
          <div className="cta-content">
            <h2>Ready to Grow Your Business?</h2>
            <p>
              Join thousands of successful vendors who are growing their businesses 
              with Nearమీ. Start your journey today and transform your local business.
            </p>
            <div className="cta-buttons">
              <a href="/vendor-registration" className="cta-btn primary">
                <Users size={20} />
                Register Your Business
              </a>
              <a href="/contact" className="cta-btn secondary">
                <MessageCircle size={20} />
                Get Personalized Help
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default VendorSuccessHub;