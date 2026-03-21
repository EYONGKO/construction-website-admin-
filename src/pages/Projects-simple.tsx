import React from 'react';

const Projects: React.FC = () => {
  const handleAddProject = () => {
    console.log('Adding new project...');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Projects Management</h1>
        <button
          onClick={handleAddProject}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          + Add Project
        </button>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search projects..."
            style={{
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              width: '200px'
            }}
          />
          <select
            style={{
              padding: '8px 12px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              width: '150px'
            }}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="planning">Planning</option>
          </select>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Project Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Budget</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Deadline</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px' }}>Office Complex A</td>
              <td style={{ padding: '12px' }}>
                <span style={{ backgroundColor: '#1890ff', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>In Progress</span>
              </td>
              <td style={{ padding: '12px' }}>$500,000</td>
              <td style={{ padding: '12px' }}>2024-06-30</td>
              <td style={{ padding: '12px' }}>
                <button style={{ marginRight: '8px', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                <button style={{ padding: '4px 8px', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px' }}>Residential Tower B</td>
              <td style={{ padding: '12px' }}>
                <span style={{ backgroundColor: '#faad14', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Planning</span>
              </td>
              <td style={{ padding: '12px' }}>$1,200,000</td>
              <td style={{ padding: '12px' }}>2024-12-31</td>
              <td style={{ padding: '12px' }}>
                <button style={{ marginRight: '8px', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                <button style={{ padding: '4px 8px', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px' }}>Shopping Mall C</td>
              <td style={{ padding: '12px' }}>
                <span style={{ backgroundColor: '#52c41a', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Completed</span>
              </td>
              <td style={{ padding: '12px' }}>$800,000</td>
              <td style={{ padding: '12px' }}>2024-03-15</td>
              <td style={{ padding: '12px' }}>
                <button style={{ marginRight: '8px', padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                <button style={{ padding: '4px 8px', border: '1px solid #ff4d4f', color: '#ff4d4f', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Projects;
