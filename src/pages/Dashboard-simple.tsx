import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>Dashboard Overview</h1>
      
      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff6b35', marginBottom: '8px' }}>24</div>
          <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>Total Projects</div>
          <div style={{ fontSize: '12px', color: '#3f8600', marginTop: '8px' }}>↑ 12% from last month</div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>12</div>
          <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>Active Services</div>
          <div style={{ fontSize: '12px', color: '#3f8600', marginTop: '8px' }}>↑ 8% from last month</div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#722ed1', marginBottom: '8px' }}>48</div>
          <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>Team Members</div>
          <div style={{ fontSize: '12px', color: '#cf1322', marginTop: '8px' }}>↓ 3% from last month</div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#cf1322', marginBottom: '8px' }}>$2.85M</div>
          <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase' }}>Total Revenue</div>
          <div style={{ fontSize: '12px', color: '#3f8600', marginTop: '8px' }}>↑ 24% from last month</div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '16px' }}>Recent Projects</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Project Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Progress</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Budget</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Deadline</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px' }}>Office Complex A</td>
              <td style={{ padding: '12px' }}>
                <span style={{ backgroundColor: '#1890ff', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>In Progress</span>
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{ backgroundColor: '#f0f0f0', borderRadius: '4px', height: '8px', width: '100px' }}>
                  <div style={{ backgroundColor: '#ff6b35', height: '100%', width: '75%', borderRadius: '4px' }}></div>
                </div>
                <span style={{ fontSize: '12px', color: '#666' }}>75%</span>
              </td>
              <td style={{ padding: '12px' }}>$500,000</td>
              <td style={{ padding: '12px' }}>2024-06-30</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px' }}>Residential Tower B</td>
              <td style={{ padding: '12px' }}>
                <span style={{ backgroundColor: '#faad14', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Planning</span>
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{ backgroundColor: '#f0f0f0', borderRadius: '4px', height: '8px', width: '100px' }}>
                  <div style={{ backgroundColor: '#ff6b35', height: '100%', width: '25%', borderRadius: '4px' }}></div>
                </div>
                <span style={{ fontSize: '12px', color: '#666' }}>25%</span>
              </td>
              <td style={{ padding: '12px' }}>$1,200,000</td>
              <td style={{ padding: '12px' }}>2024-12-31</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px' }}>Shopping Mall C</td>
              <td style={{ padding: '12px' }}>
                <span style={{ backgroundColor: '#52c41a', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Completed</span>
              </td>
              <td style={{ padding: '12px' }}>
                <div style={{ backgroundColor: '#f0f0f0', borderRadius: '4px', height: '8px', width: '100px' }}>
                  <div style={{ backgroundColor: '#52c41a', height: '100%', width: '100%', borderRadius: '4px' }}></div>
                </div>
                <span style={{ fontSize: '12px', color: '#666' }}>100%</span>
              </td>
              <td style={{ padding: '12px' }}>$800,000</td>
              <td style={{ padding: '12px' }}>2024-03-15</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
