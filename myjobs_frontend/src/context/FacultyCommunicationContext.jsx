import React, { createContext, useContext, useEffect, useState } from 'react';

const FAC_COMM_KEY = 'faculty_communication_data_v1';

const initializeMockData = () => {
  if (!localStorage.getItem(FAC_COMM_KEY)) {
    const initial = {
      invites: [
        {
          id: 'f-inv-1',
          facultyId: 'fac1',
          facultyName: 'Dr. Sarah Johnson',
          facultyEmail: 'sarah.j@example.com',
          jobTitle: 'Senior Lecturer in Computer Science',
          status: 'pending', // pending | accepted | rejected | interview | hired | follow_up
          date: '2025-08-28T10:30:00Z',
          messages: [
            {
              id: 'm1',
              sender: 'recruiter',
              content: 'We received your application and would like to invite you.',
              timestamp: '2025-08-28T10:30:00Z',
              isSystem: false
            }
          ],
          lastUpdate: null
        },
        {
          id: 'f-inv-2',
          facultyId: 'fac2',
          facultyName: 'Dr. Michael Chen',
          facultyEmail: 'michael.c@example.com',
          jobTitle: 'Assistant Professor - Data Science',
          status: 'pending',
          date: '2025-08-27T14:15:00Z',
          messages: [
            {
              id: 'm2',
              sender: 'recruiter',
              content: 'Your profile looks great — please consider this position.',
              timestamp: '2025-08-27T14:15:00Z'
            }
          ],
          lastUpdate: null
        }
      ],
      sent: [
        {
          id: 'f-sent-1',
          facultyId: 'fac3',
          facultyName: 'Dr. Emily Wilson',
          facultyEmail: 'emily.w@example.com',
          jobTitle: 'Associate Professor - AI',
          status: 'accepted',
          date: '2025-08-25T09:00:00Z',
          lastUpdate: {
            status: 'interview',
            date: '2025-08-29T10:00:00Z',
            notes: 'Interview scheduled'
          },
          messages: [
            {
              id: 'm3',
              sender: 'faculty',
              content: 'Thank you — I accept the invite and look forward to it.',
              timestamp: '2025-08-25T09:05:00Z'
            },
            {
              id: 'm4',
              sender: 'recruiter',
              content: 'We scheduled an interview on Aug 29, 10:00 AM EST.',
              timestamp: '2025-08-26T14:30:00Z'
            }
          ]
        },
        {
          id: 'f-sent-2',
          facultyId: 'fac4',
          facultyName: 'Dr. Robert Taylor',
          facultyEmail: 'robert.t@example.com',
          jobTitle: 'Assistant Professor - Machine Learning',
          status: 'pending',
          date: '2025-08-30T14:20:00Z',
          messages: [
            {
              id: 'm5',
              sender: 'faculty',
              content: 'Invitation sent to candidate.',
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

const FacultyCommunicationContext = createContext();

export const useFacultyCommunication = () => useContext(FacultyCommunicationContext);

export const FacultyCommunicationProvider = ({ children }) => {
  const [data, setData] = useState(readData());

  useEffect(() => {
    // Keep local state in sync with localStorage (simple approach)
    setData(readData());
    // eslint-disable-next-line
  }, []);

  const refresh = () => {
    const d = readData();
    setData(d);
    return d;
  };

  // Counts
  const getPendingInvitesCount = () => {
    const d = readData();
    return d.invites.filter(i => i.status === 'pending').length;
  };

  // Actions: accept/reject (faculty side) for invites
  const acceptInvite = (inviteId, payload = {}) => {
    const d = readData();
    const idx = d.invites.findIndex(i => i.id === inviteId);
    if (idx === -1) return false;
    d.invites[idx].status = 'accepted';
    d.invites[idx].lastUpdate = {
      status: 'accepted',
      date: new Date().toISOString(),
      notes: payload.notes || ''
    };
    // add system message
    d.invites[idx].messages = d.invites[idx].messages || [];
    d.invites[idx].messages.push({
      id: `m${Date.now()}`,
      sender: 'faculty',
      content: payload.message || 'Faculty accepted the invite.',
      timestamp: new Date().toISOString(),
      isSystem: true
    });
    writeData(d);
    setData(d);
    return true;
  };

  const rejectInvite = (inviteId, payload = {}) => {
    const d = readData();
    const idx = d.invites.findIndex(i => i.id === inviteId);
    if (idx === -1) return false;
    d.invites[idx].status = 'rejected';
    d.invites[idx].lastUpdate = {
      status: 'rejected',
      date: new Date().toISOString(),
      notes: payload.notes || ''
    };
    d.invites[idx].messages = d.invites[idx].messages || [];
    d.invites[idx].messages.push({
      id: `m${Date.now()}`,
      sender: 'faculty',
      content: payload.message || 'Faculty rejected the invite.',
      timestamp: new Date().toISOString(),
      isSystem: true
    });
    writeData(d);
    setData(d);
    return true;
  };

  // Add status update (used when faculty updates status from modal on a sent item)
  const addStatusUpdate = (itemId, updateData) => {
    const d = readData();
    const item = [...d.invites, ...d.sent].find(i => i.id === itemId);
    if (!item) return false;
    // For faculty side we allow them to update lastUpdate (e.g., accepting a recruiter follow-up)
    item.lastUpdate = updateData;
    if (updateData.status) item.status = updateData.status;
    item.messages = item.messages || [];
    item.messages.push({
      id: `m${Date.now()}`,
      sender: 'faculty',
      content: updateData.message || `Status updated to ${updateData.status}`,
      timestamp: new Date().toISOString(),
      isSystem: true
    });
    writeData(d);
    setData(d);
    return true;
  };

  // Add a message (system messages or comments). Thread view is read-only (no client input) but we still keep message storage for history
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
      addMessage
    }}>
      {children}
    </FacultyCommunicationContext.Provider>
  );
};
