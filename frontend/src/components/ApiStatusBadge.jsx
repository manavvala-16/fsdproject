import React from 'react';
import { useApp } from '../context/AppContext';

const ApiStatusBadge = () => {
  const { healthStatus, loading, refreshHealthStatus } = useApp();

  const isExpressOnline = healthStatus && healthStatus.success;
  const isDbConnected = healthStatus?.database?.status === 'Connected';

  return (
    <div className="glass-card p-4 my-4">
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2 border-secondary border-opacity-25">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-cpu text-purple-gradient fs-4"></i>
          <h5 className="mb-0 fw-bold">System Connection Diagnostic</h5>
        </div>
        <button 
          className="btn btn-sm btn-cv-outline" 
          onClick={refreshHealthStatus}
          disabled={loading}
        >
          <i className={`bi bi-arrow-clockwise me-1 ${loading ? 'spin' : ''}`}></i>
          {loading ? 'Testing...' : 'Check Status'}
        </button>
      </div>

      <div className="row g-3">
        {/* Express Backend Server */}
        <div className="col-md-6">
          <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small text-uppercase fw-semibold">Express.js Server</span>
              {isExpressOnline ? (
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 status-online">
                  <i className="bi bi-circle-fill me-1 small"></i> Online
                </span>
              ) : (
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                  <i className="bi bi-x-circle me-1"></i> Offline
                </span>
              )}
            </div>
            <div className="small text-light">
              Endpoint: <code>GET /api/health</code>
            </div>
            <div className="small text-secondary mt-1">
              {healthStatus?.message || 'Connecting to server...'}
            </div>
          </div>
        </div>

        {/* MySQL Database */}
        <div className="col-md-6">
          <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-secondary small text-uppercase fw-semibold">MySQL Database</span>
              {isDbConnected ? (
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 status-online">
                  <i className="bi bi-database-check me-1"></i> Connected
                </span>
              ) : (
                <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                  <i className="bi bi-database-exclamation me-1"></i> Disconnected
                </span>
              )}
            </div>
            <div className="small text-light">
              Database Name: <code>{healthStatus?.database?.name || 'cinevault'}</code>
            </div>
            <div className="small text-secondary mt-1">
              {isDbConnected
                ? `Tables Created: ${healthStatus.database.tablesCount} (${healthStatus.database.tables.join(', ')})`
                : healthStatus?.database?.details || 'Ensure MySQL is running on port 3306'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatusBadge;
