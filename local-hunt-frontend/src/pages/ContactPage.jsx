import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import '../styles/ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'customer',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // EmailJS configuration
  const EMAILJS_SERVICE_ID = 'service_3pecrgs';
  const EMAILJS_TEMPLATE_ID = 'template_8s47hbu';
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
          phone: formData.phone,
          user_type: formData.userType,
          subject: `[Nearమీ Contact] ${formData.subject}`,
          message: formData.message,
          to_email: 'contact@nearmee.com',
          timestamp: new Date().toLocaleString()
        },
        EMAILJS_USER_ID
      );

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        userType: 'customer',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Us',
      details: 'contact@nearmee.com',
      description: 'Send us an email for general inquiries',
      responseTime: 'Within 24 hours'
    },
    {
      icon: '📞',
      title: 'Call Us',
      details: '+1-800-NEAR-MEE',
      description: 'Call our customer support line',
      responseTime: '9 AM - 6 PM IST'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      details: 'Available in App',
      description: 'Instant chat support within the app',
      responseTime: '9 AM - 8 PM IST'
    },
    {
      icon: '🏢',
      title: 'Visit Office',
      details: '123 Business District, Hyderabad, Telangana 500032',
      description: 'Schedule an appointment to visit us',
      responseTime: 'Mon - Fri, 10 AM - 5 PM'
    }
  ];

  const teamDepartments = [
    {
      department: 'Customer Support',
      email: 'support@nearmee.com',
      phone: '+1-800-NEAR-SUPPORT',
      description: 'For customer queries and issue resolution'
    },
    {
      department: 'Vendor Onboarding',
      email: 'vendors@nearmee.com',
      phone: '+1-800-NEAR-VENDOR',
      description: 'For vendor registration and partnership inquiries'
    },
    {
      department: 'Technical Support',
      email: 'tech@nearmee.com',
      phone: '+1-800-NEAR-TECH',
      description: 'For technical issues and bug reports'
    },
    {
      department: 'Business Partnerships',
      email: 'partnerships@nearmee.com',
      phone: '+1-800-NEAR-BIZ',
      description: 'For business collaborations and enterprise solutions'
    }
  ];

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Header Section */}
        <div className="contact-header">
          <h1>Contact Nearమీ</h1>
          <p>Get in touch with us - We'd love to hear from you and help connect local businesses with customers</p>
        </div>

        <div className="contact-content">
          {/* Contact Form Section */}
          <div className="contact-form-section">
            <div className="form-intro">
              <h2>Send us a Message</h2>
              <p>Have questions about Nearమీ? Want to partner with us? Fill out the form below and our team will get back to you soon.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="contact-form">
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
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="userType">I am a *</label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    required
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor/Business Owner</option>
                    <option value="partner">Business Partner</option>
                    <option value="investor">Investor</option>
                    <option value="other">Other</option>
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
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Please share your thoughts, questions, or partnership ideas..."
                ></textarea>
              </div>

              {submitStatus === 'success' && (
                <div className="alert success">
                  <h3>Thank You! 🎉</h3>
                  <p>Your message has been sent successfully. Our team will get back to you within 24 hours.</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="alert error">
                  <h3>Something Went Wrong 😔</h3>
                  <p>There was an error sending your message. Please try again or contact us directly at contact@nearmee.com</p>
                </div>
              )}

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Sending Message...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Contact Methods Section */}
          <div className="contact-methods-section">
            <h2>Other Ways to Reach Us</h2>
            <div className="contact-methods">
              {contactMethods.map((method, index) => (
                <div key={index} className="contact-method-card">
                  <div className="method-icon">{method.icon}</div>
                  <h3>{method.title}</h3>
                  <p className="method-detail">{method.details}</p>
                  <p className="method-description">{method.description}</p>
                  <div className="response-time">
                    <span>⏱️ {method.responseTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Departments Section */}
          <div className="departments-section">
            <h2>Contact Specific Teams</h2>
            <p>Reach out directly to the relevant team for faster response</p>
            <div className="departments-grid">
              {teamDepartments.map((dept, index) => (
                <div key={index} className="department-card">
                  <h3>{dept.department}</h3>
                  <p>{dept.description}</p>
                  <div className="contact-info">
                    <div className="contact-item">
                      <span className="icon">📧</span>
                      <a href={`mailto:${dept.email}`}>{dept.email}</a>
                    </div>
                    <div className="contact-item">
                      <span className="icon">📞</span>
                      <a href={`tel:${dept.phone}`}>{dept.phone}</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Info Section */}
          <div className="business-info-section">
            <div className="info-grid">
              <div className="info-card">
                <h3>📍 Our Headquarters</h3>
                <p>
                  Nearమీ Technologies Pvt. Ltd.<br />
                  123 Business District<br />
                  Hi-Tech City, Hyderabad<br />
                  Telangana 500032, India
                </p>
              </div>
              <div className="info-card">
                <h3>🕒 Business Hours</h3>
                <p>
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 4:00 PM<br />
                  Sunday: Closed<br />
                  <em>All times in IST</em>
                </p>
              </div>
              <div className="info-card">
                <h3>🌐 Social Media</h3>
                <div className="social-links">
                  <a href="#" className="social-link">📘 Facebook</a>
                  <a href="#" className="social-link">🐦 Twitter</a>
                  <a href="#" className="social-link">📷 Instagram</a>
                  <a href="#" className="social-link">💼 LinkedIn</a>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Support */}
          <div className="emergency-section">
            <div className="emergency-alert">
              <div className="alert-icon">🚨</div>
              <div className="alert-content">
                <h3>Urgent Technical Issues?</h3>
                <p>For critical platform issues affecting multiple users or vendors, contact our emergency technical support:</p>
                <div className="emergency-contact">
                  <strong>📞 +1-800-NEAR-URGENT</strong>
                  <span> | </span>
                  <strong>📧 emergency@nearmee.com</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;