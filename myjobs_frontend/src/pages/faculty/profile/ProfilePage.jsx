import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Tab, Nav, Card, Button, Toast, ToastContainer } from 'react-bootstrap';
import BasicInfo from './sections/BasicInfo';
import EducationalInfo from './sections/EducationalInfo';
import Transcript from './sections/Transcript';
import Certificates from './sections/Certificates';
import Memberships from './sections/Memberships';
import Experience from './sections/Experience';
import Documents from './sections/Documents';
import './profile.css';

const ProfilePage = () => {
  // Get the active tab from URL or default to 'basic'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      // Validate the tab value to prevent invalid tab selection
      const validTabs = ['basic', 'education', 'transcript', 'certificates', 'memberships', 'experience', 'documents'];
      return validTabs.includes(tab) ? tab : 'basic';
    }
    return 'basic';
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: '', variant: 'success' });
  
  // Store the previous active tab to detect changes
  const prevActiveTabRef = useRef(activeTab);

  // Refs for section components
  const basicInfoRef = useRef(null);
  const educationInfoRef = useRef(null);
  const transcriptRef = useRef(null);
  const certificatesRef = useRef(null);
  const membershipsRef = useRef(null);
  const experienceRef = useRef(null);
  const documentsRef = useRef(null);

  // Handle tab changes and URL updates
  useEffect(() => {
    // Scroll to top when tab changes
    window.scrollTo(0, 0);
    
    // Update URL when tab changes
    if (prevActiveTabRef.current !== activeTab && typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('tab', activeTab);
      window.history.pushState({}, '', url);
      prevActiveTabRef.current = activeTab;
    }
  }, [activeTab]);
  
  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'basic';
      setActiveTab(tab);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when tab changes
  const handleTabSelect = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple saves
    
    setIsSaving(true);
    setShowToast({ show: false, message: '', variant: 'success' });
    
    try {
      // Define all possible sections
      const allSections = [
        { ref: basicInfoRef, name: 'Basic Info' },
        { ref: educationInfoRef, name: 'Education' },
        { ref: transcriptRef, name: 'Transcript' },
        { ref: certificatesRef, name: 'Certificates' },
        { ref: membershipsRef, name: 'Memberships' },
        { ref: experienceRef, name: 'Experience' },
        { ref: documentsRef, name: 'Documents' },
      ];
      
      // Filter to only include sections that have a save method
      const sectionRefs = allSections.filter(section => 
        typeof section.ref.current?.save === 'function'
      );
      
      if (sectionRefs.length === 0) {
        // No sections to save, exit edit mode
        setIsEditing(false);
        return;
      }
      
      // Save all sections in sequence to prevent duplicate messages
      const saveResults = [];
      
      for (const section of sectionRefs) {
        try {
          const result = await section.ref.current.save();
          saveResults.push({
            ...result,
            section: section.name,
            success: result?.ok === true
          });
        } catch (error) {
          saveResults.push({
            ok: false,
            error: error?.message || 'Unknown error',
            section: section.name,
            success: false
          });
          // Break on first error if you want to stop on error
          // break;
        }
      }
      
      // Check results
      const failedSections = saveResults.filter(r => !r.ok);
      
      if (failedSections.length === 0) {
        // All saves successful - exit edit mode immediately
        setIsEditing(false);
      } else {
        // Some saves failed
        const failedSectionNames = failedSections.map(f => f.section).join(', ');
        const errorMessage = failedSections[0]?.error || 'An unknown error occurred';
        
        setShowToast({
          show: true,
          message: `Failed to save: ${failedSectionNames}. ${errorMessage}`,
          variant: 'danger'
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setShowToast({
        show: true,
        message: 'An unexpected error occurred while saving. Please try again.',
        variant: 'danger'
      });
    } finally {
      setIsSaving(false);
    }
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
              <Button variant="primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </Col>
      </Row>

      <Tab.Container activeKey={activeTab} onSelect={handleTabSelect}>
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
            <Tab.Content className='bg-light '>
              <Tab.Pane eventKey="basic">
                <BasicInfo ref={basicInfoRef} isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="education">
                <EducationalInfo ref={educationInfoRef} isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="transcript">
                <Transcript ref={transcriptRef} isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="certificates">
                <Certificates ref={certificatesRef} isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="memberships">
                <Memberships ref={membershipsRef} isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="experience">
                <Experience ref={experienceRef} isEditing={isEditing} />
              </Tab.Pane>
              <Tab.Pane eventKey="documents">
                <Documents ref={documentsRef} isEditing={isEditing} />
              </Tab.Pane>
            </Tab.Content>
            
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 11 }}>
              <Toast 
                onClose={() => setShowToast({...showToast, show: false})} 
                show={showToast.show} 
                delay={5000} 
                autohide
                bg={showToast.variant}
              >
                <Toast.Header closeButton>
                  <strong className="me-auto">
                    {showToast.variant === 'success' ? 'Success' : 'Error'}
                  </strong>
                </Toast.Header>
                <Toast.Body className="text-white">
                  {showToast.message}
                </Toast.Body>
              </Toast>
            </ToastContainer>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default ProfilePage;
