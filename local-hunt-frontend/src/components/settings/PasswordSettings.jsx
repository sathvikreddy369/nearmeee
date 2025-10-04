// src/components/settings/PasswordSettings.jsx
import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { changePassword } from '../../services/authApi';

function PasswordSettings({ onLoadingChange }) {
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    onLoadingChange(true);

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('All password fields are required.');
      onLoadingChange(false);
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      onLoadingChange(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      onLoadingChange(false);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password.');
      onLoadingChange(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setSuccess('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      addToast('success', 'Password changed successfully!');
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      onLoadingChange(false);
    }
  };

  const hasChanges = formData.currentPassword || formData.newPassword || formData.confirmPassword;

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-2">Password & Security</h4>
        <p className="text-muted mb-0">
          Change your password to keep your account secure.
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="border-0 bg-light">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark">
                <Lock size={18} className="me-2" />
                Current Password
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  required
                  className="py-3 pe-5"
                />
                <Button
                  variant="link"
                  className="position-absolute top-50 end-0 translate-middle-y text-muted p-1"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark">New Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  required
                  className="py-3 pe-5"
                />
                <Button
                  variant="link"
                  className="position-absolute top-50 end-0 translate-middle-y text-muted p-1"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              <Form.Text className="text-muted">
                Password must be at least 6 characters long.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark">Confirm New Password</Form.Label>
              <div className="position-relative">
                <Form.Control
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                  className="py-3 pe-5"
                />
                <Button
                  variant="link"
                  className="position-absolute top-50 end-0 translate-middle-y text-muted p-1"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
            </Form.Group>

            <div className="d-flex gap-3">
              <Button
                variant="primary"
                type="submit"
                disabled={!hasChanges}
                className="d-flex align-items-center px-4 py-2"
              >
                <Lock size={18} className="me-2" />
                Change Password
              </Button>
              
              {hasChanges && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
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

export default PasswordSettings;