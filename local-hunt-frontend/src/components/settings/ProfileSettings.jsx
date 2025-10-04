// src/components/settings/ProfileSettings.jsx
import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { User, Mail, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { updateUserProfile } from '../../services/authApi';

function ProfileSettings({ onLoadingChange }) {
  const { userProfile, refreshUserProfile } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    onLoadingChange(true);

    if (!formData.name.trim()) {
      setError('Name is required.');
      onLoadingChange(false);
      return;
    }

    try {
      await updateUserProfile({
        name: formData.name.trim(),
        email: formData.email !== userProfile.email ? formData.email : undefined
      });
      
      await refreshUserProfile();
      setSuccess('Profile updated successfully!');
      addToast('success', 'Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      onLoadingChange(false);
    }
  };

  const hasChanges = formData.name !== userProfile?.name || formData.email !== userProfile?.email;

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-2">Profile Information</h4>
        <p className="text-muted mb-0">
          Update your personal information and how you appear on the platform.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="border-0 bg-light">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark">
                <User size={18} className="me-2" />
                Full Name
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="py-3"
              />
              <Form.Text className="text-muted">
                This will be displayed on your profile and reviews.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark">
                <Mail size={18} className="me-2" />
                Email Address
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                className="py-3"
              />
              <Form.Text className="text-muted">
                {formData.email !== userProfile?.email && 
                 'You will need to verify your new email address.'}
              </Form.Text>
            </Form.Group>

            <div className="d-flex gap-3">
              <Button
                variant="primary"
                type="submit"
                disabled={!hasChanges}
                className="d-flex align-items-center px-4 py-2"
              >
                <Save size={18} className="me-2" />
                Save Changes
              </Button>
              
              {hasChanges && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setFormData({
                    name: userProfile?.name || '',
                    email: userProfile?.email || '',
                  })}
                >
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ProfileSettings;