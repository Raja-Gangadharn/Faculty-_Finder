import React, { createContext, useContext, useEffect, useState } from 'react';

const FAC_COMM_KEY = 'faculty_communication_data_v1';

const initializeMockData = () => {
  if (!localStorage.getItem(FAC_COMM_KEY)) {
    const initial = {
      invites: [
        {
          id: 'f-inv-1',
          collegeId: 'col1',
          collegeName: 'Stanford University',
          collegeEmail: 'hr@stanford.edu',
          jobTitle: 'Senior Lecturer in Computer Science',
          status: 'pending',
          date: '2025-08-28T10:30:00Z',
          messages: [
            {
              id: 'm1',
              sender: 'recruiter',
              content: 'We received your application and would like to invite you for an interview.',
              timestamp: '2025-08-28T10:30:00Z',
              isSystem: false
            }
          ],
          lastUpdate: null
        },
        {
          id: 'f-inv-2',
          collegeId: 'col2',
          collegeName: 'MIT',
          collegeEmail: 'careers@mit.edu',
          jobTitle: 'Assistant Professor - Data Science',
          status: 'pending',
          date: '2025-08-27T14:15:00Z',
          messages: [
            {
              id: 'm2',
              sender: 'recruiter',
              content: 'Your application has been shortlisted for the next round.',
              timestamp: '2025-08-27T14:15:00Z'
            }
          ],
          lastUpdate: null
        }
      ],
      sent: [
        {
          id: 'f-sent-1',
          collegeId: 'col3',
          collegeName: 'Harvard University',
          collegeEmail: 'academicaffairs@harvard.edu',
          jobTitle: 'Associate Professor - AI',
          status: 'accepted',
          date: '2025-08-25T09:00:00Z',
          lastUpdate: {
            status: 'interview',
            date: '2025-08-29T10:00:00Z',
            notes: 'Interview scheduled with the department head'
          },
          messages: [
            {
              id: 'm3',
              sender: 'faculty',
              content: 'I accept the interview invitation. Looking forward to discussing the position.',
              timestamp: '2025-08-25T09:05:00Z'
            },
            {
              id: 'm4',
              sender: 'recruiter',
              content: 'Your interview is scheduled for Aug 29, 10:00 AM EST. The meeting link will be sent via email.',
              timestamp: '2025-08-26T14:30:00Z'
            }
          ]
        },
        {
          id: 'f-sent-2',
          collegeId: 'col4',
          collegeName: 'Caltech',
          collegeEmail: 'faculty.recruitment@caltech.edu',
          jobTitle: 'Assistant Professor - Machine Learning',
          status: 'pending',
          date: '2025-08-30T14:20:00Z',
          messages: [
            {
              id: 'm5',
              sender: 'faculty',
              content: 'Application submitted successfully.',
              timestamp: '2025-08-30T14:20:00Z'
            }
          ],
          lastUpdate: null
        }
      ]
    };
    localStorage.setItem(FAC_COMM_KEY, JSON.stringify(initial));
  }
};

const readData = () => {
  initializeMockData();
  return JSON.parse(localStorage.getItem(FAC_COMM_KEY));
};

const writeData = (data) => {
  localStorage.setItem(FAC_COMM_KEY, JSON.stringify(data));
};

// Helper: which statuses are considered real/main statuses for filtering UI
// in FacultyCommunicationContext.jsx
export const isMainStatus = (s) => ['pending','accepted','rejected','interview','hired'].includes(s);

// and include `isMainStatus` inside the returned provider value
// so useFacultyCommunication() returns it.


const FacultyCommunicationContext = createContext();

export const useFacultyCommunication = () => useContext(FacultyCommunicationContext);

export const FacultyCommunicationProvider = ({ children }) => {
  const [data, setData] = useState(readData());

  useEffect(() => {
    setData(readData());
    // eslint-disable-next-line
  }, []);

  const refresh = () => {
    const d = readData();
    setData(d);
    return d;
  };

  const getPendingInvitesCount = () => {
    const d = readData();
    return d.invites.filter(i => i.status === 'pending').length;
  };

  // Accept invite (faculty)
  const acceptInvite = (inviteId, payload = {}) => {
    const d = readData();
    const idx = d.invites.findIndex(i => i.id === inviteId);
    if (idx === -1) return false;

    const invite = d.invites[idx];
    invite.status = 'accepted';
    invite.lastUpdate = {
      status: 'accepted',
      date: new Date().toISOString(),
      notes: payload.notes || ''
    };

    invite.messages = invite.messages || [];
    invite.messages.push({
      id: `m${Date.now()}`,
      sender: 'faculty',
      content: payload.message || 'Faculty accepted the invite.',
      timestamp: new Date().toISOString(),
      isSystem: true
    });

    writeData(d);
    setData(d);
    console.log('[context] acceptInvite ->', inviteId, invite.status);
    return true;
  };

  // Reject invite (faculty)
  const rejectInvite = (inviteId, payload = {}) => {
    const d = readData();
    const idx = d.invites.findIndex(i => i.id === inviteId);
    if (idx === -1) return false;

    const invite = d.invites[idx];
    invite.status = 'rejected';
    invite.lastUpdate = {
      status: 'rejected',
      date: new Date().toISOString(),
      notes: payload.notes || ''
    };

    invite.messages = invite.messages || [];
    invite.messages.push({
      id: `m${Date.now()}`,
      sender: 'faculty',
      content: payload.message || 'Faculty rejected the invite.',
      timestamp: new Date().toISOString(),
      isSystem: true
    });

    writeData(d);
    setData(d);
    console.log('[context] rejectInvite ->', inviteId, invite.status);
    return true;
  };

// --- inside FacultyCommunicationContext.jsx ---

// helper already defined elsewhere in file:
// const isMainStatus = (s) => ['pending','accepted','rejected','interview','hired'].includes(s);

const addStatusUpdate = (itemId, updateData) => {
  const d = readData();
  const item = [...d.invites, ...d.sent].find(i => i.id === itemId);
  if (!item) return false;

  // Keep a copy of previous lastUpdate (if any)
  const prevLast = item.lastUpdate || {};

  // Decide what the lastUpdate.status should be after this update:
  // - If the incoming update is a MAIN status -> use it (replace)
  // - If incoming update is non-main (e.g. follow_up) AND previous lastUpdate.status is a MAIN -> keep previous main status
  // - Otherwise fallback to item.status (the primary status)
  const incomingStatus = updateData.status;
  let newLastStatus = null;

  if (incomingStatus && isMainStatus(incomingStatus)) {
    newLastStatus = incomingStatus;
  } else if (prevLast.status && isMainStatus(prevLast.status)) {
    // preserve the prior main status (do NOT overwrite it with follow_up)
    newLastStatus = prevLast.status;
  } else {
    // no prior main lastUpdate — keep the item's main status as the display fallback
    newLastStatus = item.status || incomingStatus || null;
  }

  // Compose new lastUpdate: merge previous + incoming, but FORCE the status we decided above
  item.lastUpdate = {
    ...prevLast,
    ...updateData,
    status: newLastStatus,
    date: updateData.date || new Date().toISOString()
  };

  // Append any message/notes to the message thread (so follow_up text is recorded)
  const messageContent = updateData.message || updateData.notes || null;
  if (messageContent) {
    item.messages = item.messages || [];
    item.messages.push({
      id: `m${Date.now()}`,
      sender: 'faculty',
      content: messageContent,
      timestamp: new Date().toISOString(),
      isSystem: !!updateData.status // optional marker
    });
    console.log('[context] addStatusUpdate -> message appended', itemId, messageContent);
  }

  // If incoming status is a MAIN one also update item.status
  if (incomingStatus && isMainStatus(incomingStatus)) {
    item.status = incomingStatus;
  }

  writeData(d);
  setData(d);
  return true;
};


  // Add a plain message
  const addMessage = (itemId, message) => {
    const d = readData();
    const item = [...d.invites, ...d.sent].find(i => i.id === itemId);
    if (!item) return false;
    item.messages = item.messages || [];
    item.messages.push({
      id: `m${Date.now()}`,
      ...message,
      timestamp: new Date().toISOString()
    });
    writeData(d);
    setData(d);
    console.log('[context] addMessage ->', itemId, message);
    return true;
  };

  return (
    <FacultyCommunicationContext.Provider value={{
      data,
      refresh,
      getPendingInvitesCount,
      acceptInvite,
      rejectInvite,
      addStatusUpdate,
      addMessage,
      isMainStatus // export helper for UI if needed
    }}>
      {children}
    </FacultyCommunicationContext.Provider>
  );
};
