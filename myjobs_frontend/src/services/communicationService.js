// Mock data for communication features
const COMMUNICATION_KEY = 'faculty_finder_communication';

// Initialize with sample data if none exists
const initializeMockData = () => {
  if (!localStorage.getItem(COMMUNICATION_KEY)) {
    const mockData = {
      invites: [
        {
          id: 'inv1',
          facultyId: 'fac1',
          facultyName: 'Dr. Sarah Johnson',
          facultyEmail: 'sarah.j@example.com',
          jobTitle: 'Senior Lecturer in Computer Science',
          status: 'pending',
          date: '2025-08-28T10:30:00Z',
          messages: [
            {
              id: 'msg1',
              sender: 'faculty',
              content: 'I am interested in the Senior Lecturer position. I have 8 years of teaching experience.',
              timestamp: '2025-08-28T10:30:00Z'
            }
          ]
        },
        {
          id: 'inv2',
          facultyId: 'fac2',
          facultyName: 'Dr. Michael Chen',
          facultyEmail: 'michael.c@example.com',
          jobTitle: 'Assistant Professor - Data Science',
          status: 'pending',
          date: '2025-08-27T14:15:00Z',
          messages: [
            {
              id: 'msg2',
              sender: 'faculty',
              content: 'I would like to apply for the Assistant Professor position in Data Science.',
              timestamp: '2025-08-27T14:15:00Z'
            }
          ]
        }
      ],
      sent: [
        {
          id: 'sent1',
          facultyId: 'fac3',
          facultyName: 'Dr. Emily Wilson',
          facultyEmail: 'emily.w@example.com',
          jobTitle: 'Associate Professor - AI',
          status: 'accepted',
          date: '2025-08-25T09:00:00Z',
          lastUpdate: {
            status: 'interview',
            date: '2025-08-29T10:00:00Z',
            notes: 'Scheduled for technical interview',
            interviewTime: '10:00 AM',
            timezone: 'EST'
          },
          messages: [
            {
              id: 'msg3',
              sender: 'recruiter',
              content: 'Invitation to apply for Associate Professor position in AI',
              timestamp: '2025-08-25T09:00:00Z'
            },
            {
              id: 'msg4',
              sender: 'faculty',
              content: 'Thank you for the invitation. I accept and would like to proceed.',
              timestamp: '2025-08-26T11:20:00Z'
            },
            {
              id: 'msg5',
              sender: 'recruiter',
              content: 'Great! We have scheduled a technical interview for August 29th at 10:00 AM EST.',
              timestamp: '2025-08-26T14:30:00Z'
            }
          ]
        },
        {
          id: 'sent2',
          facultyId: 'fac4',
          facultyName: 'Dr. Robert Taylor',
          facultyEmail: 'robert.t@example.com',
          jobTitle: 'Assistant Professor - Machine Learning',
          status: 'pending',
          date: '2025-08-30T14:20:00Z',
          messages: [
            {
              id: 'msg6',
              sender: 'recruiter',
              content: 'Invitation to apply for Assistant Professor position in Machine Learning',
              timestamp: '2025-08-30T14:20:00Z',
              isSystem: false
            }
          ]
        }
      ]
    };
    localStorage.setItem(COMMUNICATION_KEY, JSON.stringify(mockData));
  }
};

// Get all communication data
const getCommunicationData = () => {
  initializeMockData();
  return JSON.parse(localStorage.getItem(COMMUNICATION_KEY));
};

// Get pending invites count
const getPendingInvitesCount = () => {
  const data = getCommunicationData();
  return data.invites.filter(invite => invite.status === 'pending').length;
};

// Update invite status
const updateInviteStatus = (inviteId, status) => {
  const data = getCommunicationData();
  const inviteIndex = data.invites.findIndex(invite => invite.id === inviteId);
  
  if (inviteIndex !== -1) {
    const invite = data.invites[inviteIndex];
    invite.status = status;
    
    // Add auto-message for accepted/rejected status
    if (status === 'accepted' || status === 'rejected') {
      const messageContent = status === 'accepted' 
        ? 'Recruiter has accepted your application.' 
        : 'Recruiter has rejected your application.';
      
      if (!invite.messages) invite.messages = [];
      invite.messages.push({
        id: `msg${Date.now()}`,
        sender: 'recruiter',
        content: messageContent,
        isSystem: true,
        timestamp: new Date().toISOString()
      });
    }
    
    localStorage.setItem(COMMUNICATION_KEY, JSON.stringify(data));
    return true;
  }
  return false;
};

// Add status update
// helper: which statuses are main (used for filtering/display)
// helper: main statuses for filtering & preservation
const MAIN_STATUSES = ['pending', 'accepted', 'rejected', 'interview', 'hired'];
const isMainStatus = (s) => MAIN_STATUSES.includes(s);

// Add status update (only updates lastUpdate & item.status; does NOT append messages)
const addStatusUpdate = (inviteId, updateData) => {
  const data = getCommunicationData();
  const invite = [...data.invites, ...data.sent].find(inv => inv.id === inviteId);

  if (invite) {
    // Preserve previous lastUpdate so we don't overwrite a main status with follow_up
    const prevLast = invite.lastUpdate || {};
    const incomingStatus = updateData.status;

    // Decide new lastUpdate.status:
    // - if incoming is main -> use incoming
    // - else if prevLast.status is main -> keep prevLast.status (do not overwrite with follow_up)
    // - else fallback to incoming or invite.status
    let newLastStatus = null;
    if (incomingStatus && isMainStatus(incomingStatus)) {
      newLastStatus = incomingStatus;
    } else if (prevLast.status && isMainStatus(prevLast.status)) {
      newLastStatus = prevLast.status;
    } else {
      newLastStatus = incomingStatus || invite.status || null;
    }

    // Merge lastUpdate but force our determined status & date
    invite.lastUpdate = {
      ...prevLast,
      ...updateData,
      status: newLastStatus,
      date: updateData.date || new Date().toISOString()
    };

    // If incoming is main status, also update invite.status
    if (incomingStatus && isMainStatus(incomingStatus)) {
      invite.status = incomingStatus;
    }

    // DO NOT append messages here — caller will add a single message.
    localStorage.setItem(COMMUNICATION_KEY, JSON.stringify(data));
    return true;
  }
  return false;
};

// Add message to conversation
const addMessage = (inviteId, messageData) => {
  const data = getCommunicationData();
  const invite = [...data.invites, ...data.sent].find(inv => inv.id === inviteId);
  
  if (invite) {
    if (!invite.messages) invite.messages = [];
    invite.messages.push({
      id: `msg${Date.now()}`,
      ...messageData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(COMMUNICATION_KEY, JSON.stringify(data));
    return true;
  }
  return false;
};

export default {
  getCommunicationData,
  getPendingInvitesCount,
  updateInviteStatus,
  addStatusUpdate,
  addMessage
};
