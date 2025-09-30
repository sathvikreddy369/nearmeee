import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Shield, Lock, Eye, UserCheck } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const lastUpdated = "December 1, 2024";

  const sections = [
    {
      icon: <Shield size={24} />,
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, 
                update your profile, use our services, or contact us. This may include:
                • Personal information (name, email, phone number)
                • Business information (business name, services, location)
                • Profile information (photos, descriptions)
                • Communication data (messages, reviews)`
    },
    {
      icon: <Eye size={24} />,
      title: 'How We Use Your Information',
      content: `We use the information we collect to:
                • Provide, maintain, and improve our services
                • Personalize your experience and content
                • Communicate with you about products, services, and promotions
                • Process transactions and send related information
                • Detect, investigate, and prevent fraudulent transactions
                • Comply with legal obligations`
    },
    {
      icon: <Lock size={24} />,
      title: 'Information Sharing',
      content: `We do not sell your personal information. We may share your information with:
                • Other users (as necessary for the service to function)
                • Service providers who perform services on our behalf
                • Professional advisors (lawyers, bankers, auditors)
                • Law enforcement or government agencies when required by law
                • Other parties in connection with a business transaction`
    },
    {
      icon: <UserCheck size={24} />,
      title: 'Your Rights and Choices',
      content: `You have certain rights regarding your personal information:
                • Access and update your information through your account settings
                • Opt-out of marketing communications
                • Request deletion of your personal information
                • Data portability rights
                • Object to processing of your personal information
                Contact us to exercise any of these rights.`
    }
  ];

  return (
    <Container className="py-5" style={{ paddingTop: '100px' }}>
      <Row className="justify-content-center">
        <Col lg={10}>
          {/* Header */}
          <div className="text-center mb-5">
            <Shield size={48} className="text-primary mb-3" />
            <h1 className="display-4 fw-bold text-dark mb-3">Privacy Policy</h1>
            <p className="text-muted lead mb-3">
              Last updated: {lastUpdated}
            </p>
            <p className="text-muted">
              We are committed to protecting your privacy and being transparent about how we handle your personal information.
            </p>
          </div>

          {/* Introduction */}
          <Card className="border-0 shadow-sm mb-5">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-dark mb-3">Introduction</h3>
              <p className="text-muted mb-0">
                This Privacy Policy describes how LocalHunt ("we," "us," or "our") collects, uses, 
                and shares your personal information when you use our website, mobile application, 
                and services (collectively, the "Services"). By using our Services, you agree to 
                the collection and use of information in accordance with this policy.
              </p>
            </Card.Body>
          </Card>

          {/* Policy Sections */}
          {sections.map((section, index) => (
            <Card key={index} className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-start mb-3">
                  <div className="text-primary me-3">
                    {section.icon}
                  </div>
                  <h3 className="fw-bold text-dark">{section.title}</h3>
                </div>
                <div className="ms-5">
                  {section.content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="text-muted mb-2">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </Card.Body>
            </Card>
          ))}

          {/* Additional Sections */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-dark mb-3">Data Security</h3>
              <p className="text-muted mb-0">
                We implement appropriate technical and organizational security measures designed to 
                protect the security of any personal information we process. However, despite our 
                safeguards and efforts to secure your information, no electronic transmission over 
                the Internet or information storage technology can be guaranteed to be 100% secure.
              </p>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-dark mb-3">Changes to This Policy</h3>
              <p className="text-muted mb-0">
                We may update this privacy policy from time to time. The updated version will be 
                indicated by an updated "Last updated" date and the updated version will be effective 
                as soon as it is accessible. We encourage you to review this privacy policy frequently 
                to be informed of how we are protecting your information.
              </p>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-dark mb-3">Contact Us</h3>
              <p className="text-muted mb-0">
                If you have any questions or concerns about this Privacy Policy or our data practices, 
                please contact us at privacy@localhunt.com or through our contact page.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PrivacyPolicyPage;