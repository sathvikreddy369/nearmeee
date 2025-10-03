import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import '../styles/SupportPage.css';

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    urgency: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // EmailJS configuration
  const EMAILJS_SERVICE_ID = 'Yetowarrior_lo7p3ti';
  const EMAILJS_TEMPLATE_ID = 'template_l4v1se3';
  const EMAILJS_USER_ID = 'TiPzxagvRdKCbOX_C';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: `[Nearమీ Support] ${formData.subject}`,
          category: formData.category,
          urgency: formData.urgency,
          message: formData.message,
          to_email: 'support@nearmee.com'
        },
        EMAILJS_USER_ID
      );

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: '',
        urgency: 'medium'
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      question: "How do I register as a vendor on Nearమీ?",
      answer: "Click on 'Register as Vendor' from the homepage, fill in your business details, upload required documents, and our team will verify your account within 24-48 hours."
    },
    {
      question: "How does Nearమీ determine my location?",
      answer: "We use your device's GPS and IP address to suggest nearby vendors. You can also manually select your city or area for more precise results."
    },
    {
      question: "Are there any fees for using Nearమీ?",
      answer: "Nearమీ is free for customers. Vendors pay a small commission on successful transactions through our platform."
    },
    {
      question: "How do I update my business information?",
      answer: "Vendors can log into their dashboard, go to 'My Business' section, and update information like hours, services, and contact details."
    },
    {
      question: "How does the messaging system work?",
      answer: "Customers can message vendors directly through the app. Vendors will receive notifications and can respond via their dashboard or mobile app."
    }
  ];

  const supportCategories = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'vendor', label: 'Vendor Support' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'account', label: 'Account Issues' },
    { value: 'bug', label: 'Report a Bug' },
    { value: 'feature', label: 'Feature Request' }
  ];

  return (
    <div className="support-page">
      <div className="support-container">
        {/* Header Section */}
        <div className="support-header">
          <h1>Nearమీ Support Center</h1>
          <p>We're here to help you connect with local businesses seamlessly</p>
        </div>

        <div className="support-content">
          {/* Contact Form Section */}
          <div className="contact-section">
            <h2>Get in Touch</h2>
            <p>Having issues? Our support team is ready to assist you.</p>
            
            <form onSubmit={handleSubmit} className="support-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Issue Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {supportCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="urgency">Urgency Level *</label>
                  <select
                    id="urgency"
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Detailed Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce, etc."
                ></textarea>
              </div>

              {submitStatus === 'success' && (
                <div className="alert success">
                  Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="alert error">
                  Sorry, there was an error sending your message. Please try again or contact us directly at support@nearmee.com
                </div>
              )}

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqItems.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Help Section */}
          <div className="quick-help-section">
            <h2>Quick Help</h2>
            <div className="help-cards">
              <div className="help-card">
                <h3>📞 Phone Support</h3>
                <p>Call us directly for urgent issues</p>
                <strong>+1-800-NEAR-MEE</strong>
                <small>Available 9 AM - 6 PM IST</small>
              </div>
              <div className="help-card">
                <h3>📧 Email Support</h3>
                <p>Send us an email for detailed queries</p>
                <strong>support@nearmee.com</strong>
                <small>Response within 24 hours</small>
              </div>
              <div className="help-card">
                <h3>💬 Live Chat</h3>
                <p>Chat with our support team</p>
                <strong>Available in App</strong>
                <small>9 AM - 8 PM IST</small>
              </div>
            </div>
          </div>

          {/* Vendor Resources Section */}
          <div className="resources-section">
            <h2>Vendor Resources</h2>
            <div className="resource-links">
              <a href="/vendor-guide" className="resource-link">
                📚 Vendor Setup Guide
              </a>
              <a href="/business-tips" className="resource-link">
                💡 Business Growth Tips
              </a>
              <a href="/api-docs" className="resource-link">
                🔧 API Documentation
              </a>
              <a href="/marketing-kit" className="resource-link">
                🎯 Marketing Toolkit
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;