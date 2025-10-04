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
        </div>
      </div>
    </div>
  );
};

export default ContactPage;