import React, { useState } from 'react';
import { Collapse, Button, Form } from 'react-bootstrap';

/*
  JobFilters.jsx
  --------------
  Sidebar filter component used on the JobOpportunities page.
  Emits selected filters up via onChange callback.
*/

const FilterSection = ({ title, options, type = 'checkbox', values, onChange }) => {
  const [open, setOpen] = useState(true);

  const handleToggle = () => setOpen(!open);

  return (
    <div className="mb-3">
      <div
        className="d-flex justify-content-between align-items-center mb-2 cursor-pointer"
        onClick={handleToggle}
        role="button"
      >
        <h6 className="mb-0 fw-semibold text-primary">{title}</h6>
        <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
      </div>
      <Collapse in={open}>
        <div>
          {options.map((opt) => {
            const id = `${title}-${opt}`.replace(/\s+/g, '-');
            return (
              <Form.Check
                key={opt}
                id={id}
                type={type}
                name={title}
                label={opt}
                value={opt}
                checked={values.includes(opt)}
                className="mb-1"
                onChange={() => onChange(title, opt, type === 'checkbox' ? !values.includes(opt) : true)}
              />
            );
          })}
        </div>
      </Collapse>
    </div>
  );
};

const JobFilters = ({ selected, onChange }) => {
  // Filter categories and options
  const filterData = {
    'Job by Department': ['Computer Science', 'Electronics', 'Civil', 'Mechanical'],
    'Job by City': ['New York', 'Los Angeles', 'Chicago', 'Boston'],
    'Job by Experience': ['Full Time', 'Part Time', 'Contract'],
    'Job by Course': ['B.Tech', 'M.Tech', 'MBA']
  };

  const handleChange = (category, option, add) => {
    const updated = { ...selected };
    const current = new Set(updated[category] || []);
    
    if (add) {
      current.add(option);
    } else {
      current.delete(option);
    }
    updated[category] = Array.from(current);
    onChange(updated);
  };

  return (
    <div className="p-3 border rounded bg-white sticky-top" style={{ top: '80px' }}>
      {Object.entries(filterData).map(([cat, opts]) => (
        <FilterSection
          key={cat}
          title={cat}
          options={opts}
          type="checkbox"
          values={selected[cat] || []}
          onChange={handleChange}
        />
      ))}
      <Button variant="outline-secondary" size="sm" onClick={() => onChange({})}>
        Clear Filters
      </Button>
    </div>
  );
};

export default JobFilters;
