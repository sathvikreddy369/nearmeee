import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { 
  Users, 
  Target, 
  Award, 
  Heart, 
  MapPin, 
  TrendingUp,
  Code,
  Database,
  Smartphone,
  Shield,
  Globe,
  Github,
  Linkedin,
  Instagram,
  Mail,
  Calendar,
  BookOpen,
  Zap
} from 'lucide-react';
import '../styles/AboutPage.css';

const AboutPage = () => {
  // Project Overview
  const projectOverview = [
    {
      icon: <Target size={32} />,
      title: 'Project Vision',
      description: 'To create a comprehensive local services platform that connects customers with verified service providers in their area, building trust and convenience in local commerce.'
    },
    {
      icon: <Code size={32} />,
      title: 'Technology Stack',
      description: 'Built with modern technologies including React, Node.js, Firebase, and Mapbox to deliver a seamless user experience across all devices.'
    },
    {
      icon: <Users size={32} />,
      title: 'Target Audience',
      description: 'Local service providers and customers looking for reliable, verified services in their neighborhood with transparent pricing and reviews.'
    }
  ];

  // Team Members
  const teamMembers = [
    {
      name: 'Akhil Kodi',
      // role: 'Full Stack Developer & Team Lead',
      // bio: 'Led the overall architecture and development. Focused on backend APIs and system design. Passionate about building scalable applications.',
      avatar: 'AK',
      social: {
        github: 'https://github.com/akhil123-pixel',
        linkedin: 'https://linkedin.com/in/akhilkodi',
        instagram: 'https://instagram.com/akhhxil._',
        email: 'akhil25082005@gmail.com'
      }
    },
    {
      name: 'Nikhil Albai',
      // role: 'Frontend Developer & UI/UX Designer',
      // bio: 'Designed and implemented the user interface. Created responsive designs and ensured seamless user experience across all platforms.',
      avatar: 'NK',
      social: {
        github: 'https://github.com/nikhilalbai',
        linkedin: 'https://www.linkedin.com/in/nikhil-albai/',
        instagram: 'https://instagram.com/@nikhil_1_12',
        email: 'nikhilalbai4@gmail.com'
      }
    },
    {
      name: 'Prudhvi Raj Banchode',
      // role: 'Backend Developer & Database Architect',
      // bio: 'Managed database design and backend services. Implemented authentication, payment integration, and real-time features.',
      avatar: 'PR',
      social: {
        github: 'https://github.com/Prudhvi-raj-1719',
        linkedin: 'https://in.linkedin.com/in/prudhvirajbanchode',
        instagram: 'https://instagram.com/prudhviraj',
        email: 'prudhvi1791@gmail.com'
      }
    },
    {
      name: 'Sathvik Reddy pandiri',
      // role: 'Mobile Developer & QA Engineer',
      // bio: 'Developed mobile applications and conducted comprehensive testing. Ensured application reliability and performance optimization.',
      avatar: 'SR',
      social: {
        github: 'https://github.com/sathvikreddy369',
        linkedin: 'https://linkedin.com/in/sathvikreddy369',
        instagram: 'https://instagram.com/sathvikreddy._',
        email: 'satreddyyy@gmail.com'
      }
    },
    {
      name: 'Vinesh Nampally',
      // role: 'DevOps & Security Specialist',
      // bio: 'Managed deployment, CI/CD pipelines, and application security. Implemented monitoring and ensured system reliability.',
      avatar: 'VN',
      social: {
        github: 'https://github.com/Vinesh-024',
        linkedin: 'https://www.linkedin.com/in/vinesh-nampally-83a390389/',
        instagram: 'https://www.instagram.com/__vinesh__nampally__/',
        email: 'nvinesh58@gmail.com'
      }
    }
  ];

  // Project Details
  const projectDetails = [
    {
      icon: <Calendar size={32} />,
      title: 'Project Duration',
      content: '4 Months (July 2025 - October 2024)',
      description: 'Complete development lifecycle from concept to deployment'
    },
    {
      icon: <BookOpen size={32} />,
      title: 'Academic Project',
      content: '3rd Year B.Tech Computer Science',
      description: 'Under the guidance of Mentor K.yasaswini'
    },
    {
      icon: <Zap size={32} />,
      title: 'Key Features',
      content: '15+ Major Features',
      description: 'Including real-time messaging, geolocation,reviews,and advanced search'
    }
  ];

  // Technology Stack
  const techStack = [
    'React.js', 'Node.js', 'Express.js', 'Firebase','Cloudinary', 'GSTin Validator',
    'Mapbox GL JS', 'Bootstrap', 'JWT', 'REST API', 'Git',
    'Jest', 'WebSockets'
  ];

  // Project Stats
  const projectStats = [
    { value: '5,000+', label: 'Lines of Code' },
    { value: '50+', label: 'Components Built' },
    { value: '15+', label: 'API Endpoints' },
    { value: '4.8/5', label: 'Testing Coverage' }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="project-hero">
        <Container>
          <div className="hero-content">
            <Badge bg="light" text="dark" className="project-badge">
              <Calendar size={16} className="me-2" />
              3rd Year-1st Semister Project 2025
            </Badge>
            <h1 className="hero-title">Nearమీ - Local Services Platform</h1>
            <p className="hero-subtitle">
              A comprehensive college project developed by 5 passionate computer science students 
              to revolutionize how people discover and connect with local service providers. 
              Built with modern technologies and a focus on user experience.
            </p>
          </div>
        </Container>
      </section>

      {/* Project Overview */}
      <section className="project-overview">
        <Container>
          <Row className="g-4">
            {projectOverview.map((item, index) => (
              <Col key={index} lg={4} md={6}>
                <div className="overview-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="overview-icon">
                    {item.icon}
                  </div>
                  <h3 className="text-center fw-bold mb-3">{item.title}</h3>
                  <p className="text-muted text-center mb-0">{item.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-dark mb-3">Meet Our Team</h2>
              <p className="lead text-muted">
                A dedicated team of 5 computer science students passionate about building innovative solutions
              </p>
            </Col>
          </Row>
          
          <Row className="g-4">
            {teamMembers.map((member, index) => (
              <Col key={index} lg={4} md={6}>
                <div className="team-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="team-avatar">
                    {member.avatar}
                  </div>
                  <h4 className="team-name">{member.name}</h4>
                  <div className="team-role">{member.role}</div>
                  <p className="team-bio">{member.bio}</p>
                  
                  <div className="social-links">
                    <a href={member.social.github} className="social-link" title="GitHub">
                      <Github size={18} />
                    </a>
                    <a href={member.social.linkedin} className="social-link" title="LinkedIn">
                      <Linkedin size={18} />
                    </a>
                    <a href={member.social.instagram} className="social-link" title="Instagram">
                      <Instagram size={18} />
                    </a>
                    <a href={`mailto:${member.social.email}`} className="social-link" title="Email">
                      <Mail size={18} />
                    </a>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Project Details */}
      <section className="project-details">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-dark mb-3">Project Details</h2>
              <p className="lead text-muted">
                Comprehensive information about our academic project development
              </p>
            </Col>
          </Row>
          
          <Row className="g-4">
            {projectDetails.map((detail, index) => (
              <Col key={index} lg={4} md={6}>
                <div className="detail-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="detail-icon">
                    {detail.icon}
                  </div>
                  <h5 className="fw-bold mb-2">{detail.title}</h5>
                  <h6 className="text-primary mb-2">{detail.content}</h6>
                  <p className="text-muted mb-0 small">{detail.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Technology Stack */}
      <section className="tech-stack">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-dark mb-3">Technology Stack</h2>
              <p className="lead text-muted">
                Modern technologies powering the Nearమీ platform
              </p>
            </Col>
          </Row>
          
          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="text-center">
                {techStack.map((tech, index) => (
                  <Badge key={index} bg="light" text="dark" className="tech-badge">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Project Stats */}
      <section className="stats-section">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2 className="display-5 fw-bold text-white mb-3">Project Statistics</h2>
              <p className="lead text-light opacity-90">
                Key metrics from our development journey
              </p>
            </Col>
          </Row>
          
          <Row className="g-4">
            {projectStats.map((stat, index) => (
              <Col key={index} lg={3} md={6}>
                <div className="stat-card fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="project-overview">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="display-6 fw-bold text-dark mb-4">
                Interested in Our Project?
              </h2>
              <p className="lead text-muted mb-4">
                This project represents our dedication to solving real-world problems through technology. 
                We're open to collaborations and feedback from the developer community.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <a href="https://github.com/sathvikreddy/nearmee" className="btn btn-primary btn-lg">
                  <Github size={20} className="me-2" />
                  View Source Code
                </a>
                <a href="/contact" className="btn btn-outline-primary btn-lg">
                  <Mail size={20} className="me-2" />
                  Contact Our Team
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AboutPage;