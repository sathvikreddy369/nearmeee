import React, { useState } from 'react';
import { Accordion, ListGroup, Badge } from 'react-bootstrap';
import { Clock, ChevronDown } from 'lucide-react';

const OperatingHours = ({ operatingHours }) => {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const today = new Date().toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
  const [isOpen, setIsOpen] = useState(false);

  const todayHours = operatingHours[today] || 'Closed';

  return (
    <Accordion flush>
      <Accordion.Item eventKey="0" className="border-0">
        <Accordion.Header onClick={() => setIsOpen(!isOpen)} as="div" className="p-0" style={{ cursor: 'pointer' }}>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <Clock size={20} className="text-primary me-3 flex-shrink-0" />
              <div>
                <div className="fw-medium text-dark">
                  Today: <span className="text-success">{todayHours}</span>
                </div>
                <small className="text-muted">Business Hours</small>
              </div>
            </div>
            <ChevronDown
              size={20}
              className="text-muted transition-transform"
              style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </div>
        </Accordion.Header>
        <Accordion.Body className="pt-3 pb-0 px-0">
          <ListGroup variant="flush">
            {daysOfWeek.map(day => (
              <ListGroup.Item
                key={day}
                className={`d-flex justify-content-between align-items-center px-0 py-2 ${day === today ? 'bg-light rounded' : ''}`}
              >
                <span className={`text-capitalize fw-medium ${day === today ? 'text-primary' : 'text-dark'}`}>
                  {day}
                </span>
                <Badge
                  bg={operatingHours[day] && operatingHours[day].toLowerCase() !== 'closed' ? 'light' : 'danger-light'}
                  text={operatingHours[day] && operatingHours[day].toLowerCase() !== 'closed' ? 'dark' : 'danger'}
                  className="fw-medium"
                >
                  {operatingHours[day] || 'Closed'}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default OperatingHours;