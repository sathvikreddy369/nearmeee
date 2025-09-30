import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Check, Star, Award, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for individual users',
      features: [
        'Search local businesses',
        'Read reviews',
        'Save favorites',
        'Basic filters',
        'Community support'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      description: 'For power users and small businesses',
      features: [
        'Everything in Basic',
        'Advanced search filters',
        'Priority customer support',
        'Ad-free experience',
        'Early access to features',
        'Business insights'
      ],
      buttonText: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Business',
      price: '$29',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Everything in Pro',
        'Multiple user accounts',
        'Advanced analytics',
        'Custom branding',
        'API access',
        'Dedicated account manager'
      ],
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'Can I change plans later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, all paid plans come with a 14-day free trial. No credit card required to start.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.'
    },
    {
      question: 'Do you offer discounts for annual plans?',
      answer: 'Yes, save up to 20% when you choose annual billing instead of monthly.'
    }
  ];

  return (
    <Container className="py-5" style={{ paddingTop: '100px' }}>
      {/* Hero Section */}
      <Row className="text-center mb-5">
        <Col lg={8} className="mx-auto">
          <Badge bg="primary" className="mb-3 px-3 py-2 fs-6">Pricing</Badge>
          <h1 className="display-4 fw-bold text-dark mb-4">Simple, Transparent Pricing</h1>
          <p className="lead text-muted mb-4">
            Choose the perfect plan for your needs. All plans include our core features with no hidden fees.
          </p>
        </Col>
      </Row>

      {/* Pricing Cards */}
      <Row className="g-4 justify-content-center mb-5">
        {plans.map((plan, index) => (
          <Col key={index} lg={4} md={6}>
            <Card className={`border-0 shadow-lg h-100 position-relative ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && (
                <div className="position-absolute top-0 start-50 translate-middle">
                  <Badge bg="primary" className="px-3 py-2 fs-6">
                    <Star size={16} className="me-1" />
                    MOST POPULAR
                  </Badge>
                </div>
              )}
              <Card.Body className="p-4 text-center">
                <h4 className="fw-bold text-dark mb-2">{plan.name}</h4>
                <div className="my-4">
                  <span className="h1 fw-bold text-dark">{plan.price}</span>
                  {plan.period !== 'forever' && <span className="text-muted">{plan.period}</span>}
                </div>
                <p className="text-muted mb-4">{plan.description}</p>
                <ul className="list-unstyled mb-4 text-start">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="mb-3">
                      <Check size={18} className="text-success me-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={plan.popular ? "primary" : "outline-primary"} 
                  size="lg"
                  className="w-100"
                  onClick={() => navigate(plan.name === 'Business' ? '/contact' : '/auth?tab=register')}
                >
                  {plan.buttonText}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* FAQ Section */}
      <Row className="g-5 mt-5">
        <Col lg={8} className="mx-auto">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-4">Frequently Asked Questions</h2>
          </div>
          <Row className="g-4">
            {faqs.map((faq, index) => (
              <Col key={index} md={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="p-4">
                    <h6 className="fw-bold text-dark mb-3">{faq.question}</h6>
                    <p className="text-muted mb-0">{faq.answer}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* CTA Section */}
      <Row className="text-center mt-5">
        <Col lg={8} className="mx-auto">
          <Card className="border-0 bg-primary text-white">
            <Card.Body className="p-5">
              <Award size={48} className="mb-3" />
              <h3 className="fw-bold mb-3">Still have questions?</h3>
              <p className="mb-4 opacity-75">
                Our team is here to help you choose the right plan and answer any questions you might have.
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button variant="light" size="lg" onClick={() => navigate('/contact')}>
                  Contact Sales
                </Button>
                <Button variant="outline-light" size="lg" onClick={() => navigate('/support')}>
                  Visit Support
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PricingPage;