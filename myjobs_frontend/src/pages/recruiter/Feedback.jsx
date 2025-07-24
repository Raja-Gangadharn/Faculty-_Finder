
import React from 'react';
import { Accordion, Container } from 'react-bootstrap';
import '../../assets/recruiter/Feedback.css';
                                                   
const faqData = [
  {
    question: 'What is Data Structure?',
    answer:
      'A data structure is a particular way of organizing data in a computer so that it can be used effectively.',
  },
  {
    question: 'Benefits of Learning Data Structures',
    answer:
      'Any given problem has constraints on how fast the problem should be solved (time) and how much memory it consumes (space). Proper understanding of data structures helps you write efficient code that meets these constraints.',
  },
  {
    question: 'What is an array?',
    answer:
      'An array is a linear data structure that stores elements of the same data type in contiguous memory locations and allows random access.',
  },
];
const Feedback = () => {
  return (
    <div className="faq-page">
      <header className="faq-header py-5 text-center text-white">
        <h1>FAQ</h1>
        <p className="lead mb-1">This is a Sample FAQ page.</p>
        <p className="mb-0">
          Read my blog&nbsp;
          <a
            href="https://shahadsarang.com"
            target="_blank"
            rel="noreferrer"
            className="text-white fw-bold"
          >
            Shahad Sarang
          </a>
        </p>
      </header>

      <Container className="my-5">
        <Accordion>
          {faqData.map((item, idx) => (
            <Accordion.Item eventKey={String(idx)} key={idx}>
              <Accordion.Header>{item.question}</Accordion.Header>
              <Accordion.Body>{item.answer}</Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>
    </div>
  );
};

export default Feedback;

