import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PageHeader.css';

/**
 * A reusable page header component with a back button and title.
 * @param {object} props
 * @param {string} props.title - The title to display on the header.
 * @param {string} [props.backTo] - The path to navigate back to. Defaults to previous page in history.
 * @param {React.ReactNode} [props.children] - Optional action buttons or elements to display on the right.
 */
function PageHeader({ title, backTo, children }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1); // Go back to the previous page in history
    }
  };

  return (
    <div className="page-header-wrapper">
      <Container className="page-header-container">
        <Button variant="light" className="page-header-back-btn" onClick={handleBack}>
          <ArrowLeft size={20} />
        </Button>
        <h2 className="page-header-title">{title}</h2>
        <div className="page-header-actions">{children}</div>
      </Container>
    </div>
  );
}

export default PageHeader;