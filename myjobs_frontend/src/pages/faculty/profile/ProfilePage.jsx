import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tab, Nav, Card, Button } from 'react-bootstrap';
import BasicInfo from './sections/BasicInfo';
import EducationalInfo from './sections/EducationalInfo';
import Transcript from './sections/Transcript';
import Certificates from './sections/Certificates';
import Memberships from './sections/Memberships';
import Experience from './sections/Experience';
import Documents from './sections/Documents';
import './profile.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSave = () => {
    // Handle save logic
    setIsEditing(false);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>My Profile</h2>
          <p className="text-muted">Manage your personal and professional information</p>
        </Col>
        <Col className="text-end">
          {isEditing ? (
            <>
              <Button variant="outline-secondary" className="me-2" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </Col>
      </Row>

      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Row>
          <Col lg={3}>
            <Card className="mb-4">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="basic" className={`border-bottom rounded-0 ${activeTab === 'basic' ? 'active' : ''}`}>
                      Basic Information
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="education" className={`border-bottom rounded-0 ${activeTab === 'education' ? 'active' : ''}`}>
                      Educational Qualifications
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="transcript" className={`border-bottom rounded-0 ${activeTab === 'transcript' ? 'active' : ''}`}>
                      Transcript
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="certificates" className={`border-bottom rounded-0 ${activeTab === 'certificates' ? 'active' : ''}`}>
                      Certificates
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="memberships" className={`border-bottom rounded-0 ${activeTab === 'memberships' ? 'active' : ''}`}>
                      Memberships
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="experience" className={`border-bottom rounded-0 ${activeTab === 'experience' ? 'active' : ''}`}>
                      Experience
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="documents" className={`rounded-0 ${activeTab === 'documents' ? 'active' : ''}`}>
                      Documents
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={9}>
            <Tab.Content>
              <Tab.Pane eventKey="basic">
                <BasicInfo isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="education">
                <EducationalInfo isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="transcript">
                <Transcript isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="certificates">
                <Certificates isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="memberships">
                <Memberships isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="experience">
                <Experience isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="documents">
                <Documents isEditing={isEditing} />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default ProfilePage;
