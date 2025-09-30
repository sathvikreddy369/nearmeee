import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FileText, AlertTriangle, Scale, BookOpen } from 'lucide-react';

const TermsOfServicePage = () => {
  const lastUpdated = "December 1, 2024";

  const sections = [
    {
      icon: <BookOpen size={24} />,
      title: '1. Acceptance of Terms',
      content: `By accessing and using LocalHunt ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.`
    },
    {
      icon: <Scale size={24} />,
      title: '2. User Responsibilities',
      content: `You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.`
    },
    {
      icon: <AlertTriangle size={24} />,
      title: '3. Prohibited Uses',
      content: `You may not use the Service:
                • For any unlawful purpose or to solicit others to perform unlawful acts
                • To harass, abuse, insult, harm, or discriminate against others
                • To submit false or misleading information
                • To upload or transmit viruses or any malicious code
                • To spam, phish, or engage in other unethical activities`
    },
    {
      icon: <FileText size={24} />,
      title: '4. Content Ownership',
      content: `You retain ownership of any content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive license to use, display, and distribute your content through the Service.`
    }
  ];

  return (
    <Container className="py-5" style={{ paddingTop: '100px' }}>
      <Row className="justify-content-center">
        <Col lg={10}>
          {/* Header */}
          <div className="text-center mb-5">
            <FileText size={48} className="text-primary mb-3" />
            <h1 className="display-4 fw-bold text-dark mb-3">Terms of Service</h1>
            <p className="text-muted lead mb-3">
              Last updated: {lastUpdated}
            </p>
            <p className="text-muted">
              Please read these terms carefully before using our services.
            </p>
          </div>

          {/* Important Notice */}
          <Card className="border-warning mb-5">
            <Card.Body className="p-4">
              <div className="d-flex align-items-start">
                <AlertTriangle size={24} className="text-warning me-3 mt-1" />
                <div>
                  <h5 className="fw-bold text-dark mb-2">Important Legal Notice</h5>
                  <p className="text-muted mb-0">
                    These Terms of Service constitute a legally binding agreement between you and LocalHunt. 
                    By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Terms Sections */}
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
              <h3 className="fw-bold text-dark mb-3">5. Service Modifications</h3>
              <p className="text-muted mb-0">
                We reserve the right to withdraw or amend our Service, and any service or material we provide via the Service, 
                in our sole discretion without notice. We will not be liable if for any reason all or any part of the Service 
                is unavailable at any time or for any period.
              </p>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-dark mb-3">6. Termination</h3>
              <p className="text-muted mb-0">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, 
                under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-dark mb-3">7. Limitation of Liability</h3>
              <p className="text-muted mb-0">
                In no event shall LocalHunt, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
                loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h3 className="fw-bold text-dark mb-3">8. Governing Law</h3>
              <p className="text-muted mb-0">
                These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TermsOfServicePage;