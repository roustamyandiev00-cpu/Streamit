'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, TrendingUp, Users, Clock, 
  Download, Globe, Smartphone,
  Monitor, Tablet, ArrowLeft, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load analytics:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, loadAnalytics]);

  const exportData = () => {
    if (!analyticsData) return;
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <RefreshCw className="animate-spin" size={32} />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <Link href="/" className="back-button">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <div>
            <h1>Analytics Dashboard</h1>
            <p>Track your streaming performance and audience insights</p>
          </div>
        </div>
        
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button onClick={exportData} className="export-btn">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {analyticsData && (
        <>
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">
                <Users size={24} />
              </div>
              <div className="kpi-content">
                <h3>Total Viewers</h3>
                <div className="kpi-value">{analyticsData.summary.totalViewers.toLocaleString()}</div>
                <div className={`kpi-change ${analyticsData.summary.viewerGrowth >= 0 ? 'positive' : 'negative'}`}>
                  <TrendingUp size={14} />
                  {analyticsData.summary.viewerGrowth >= 0 ? '+' : ''}{analyticsData.summary.viewerGrowth}%
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <Clock size={24} />
              </div>
              <div className="kpi-content">
                <h3>Watch Time</h3>
                <div className="kpi-value">{Math.floor(analyticsData.summary.totalWatchTime / 60)}h</div>
                <div className="kpi-change positive">
                  <TrendingUp size={14} />
                  +12.5%
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <BarChart3 size={24} />
              </div>
              <div className="kpi-content">
                <h3>Engagement Rate</h3>
                <div className="kpi-value">{analyticsData.summary.engagementRate}%</div>
                <div className="kpi-change positive">
                  <TrendingUp size={14} />
                  +8.2%
                </div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">
                <Globe size={24} />
              </div>
              <div className="kpi-content">
                <h3>Avg Duration</h3>
                <div className="kpi-value">{analyticsData.summary.avgViewerDuration}m</div>
                <div className="kpi-change positive">
                  <TrendingUp size={14} />
                  +15.3%
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            {/* Viewer Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Viewer Trends</h3>
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-dot viewers"></span>
                    Total Viewers
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot unique"></span>
                    Unique Viewers
                  </span>
                </div>
              </div>
              <div className="chart-container">
                <ViewerChart data={analyticsData.timeSeries.viewers} />
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Device Breakdown</h3>
              </div>
              <div className="device-stats">
                {analyticsData.demographics.devices.map((device, index) => (
                  <div key={index} className="device-item">
                    <div className="device-icon">
                      {device.name === 'Desktop' && <Monitor size={20} />}
                      {device.name === 'Mobile' && <Smartphone size={20} />}
                      {device.name === 'Tablet' && <Tablet size={20} />}
                    </div>
                    <div className="device-info">
                      <span className="device-name">{device.name}</span>
                      <span className="device-percentage">{device.value}%</span>
                    </div>
                    <div className="device-bar">
                      <div 
                        className="device-fill" 
                        style={{ 
                          width: `${device.value}%`,
                          backgroundColor: device.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Geographic Data */}
          <div className="geo-section">
            <h3>Geographic Distribution</h3>
            <div className="geo-grid">
              {analyticsData.demographics.countries.map((country, index) => (
                <div key={index} className="geo-item">
                  <div className="geo-flag">🌍</div>
                  <div className="geo-info">
                    <span className="geo-country">{country.name}</span>
                    <span className="geo-viewers">{country.viewers} viewers</span>
                  </div>
                  <div className="geo-percentage">{country.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Streams */}
          <div className="top-streams">
            <h3>Top Performing Streams</h3>
            <div className="streams-list">
              {analyticsData.topStreams.map((stream, index) => (
                <div key={index} className="stream-item">
                  <div className="stream-rank">#{index + 1}</div>
                  <div className="stream-info">
                    <h4>{stream.title}</h4>
                    <div className="stream-stats">
                      <span>{stream.viewers} viewers</span>
                      <span>{stream.duration}min</span>
                      <span>{stream.engagement}% engagement</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .analytics-page {
          min-height: 100vh;
          background: #09090b;
          color: white;
          padding: 2rem;
        }

        .analytics-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 1rem;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #2d2e36;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #5c4dff;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s;
          font-weight: 500;
          font-size: 0.9rem;
          background: rgba(92, 77, 255, 0.1);
          border: 1px solid rgba(92, 77, 255, 0.2);
        }

        .back-button:hover {
          color: white;
          background: #5c4dff;
          border-color: #5c4dff;
          transform: translateY(-1px);
        }

        .analytics-header h1 {
          margin: 0 0 0.25rem 0;
          font-size: 2rem;
          font-weight: 700;
        }

        .analytics-header p {
          margin: 0;
          color: #a1a1aa;
        }

        .header-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .time-range-select {
          background: #1f2026;
          border: 1px solid #2d2e36;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .export-btn:hover {
          opacity: 0.9;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .kpi-card {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .kpi-icon {
          width: 48px;
          height: 48px;
          background: rgba(92, 77, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .kpi-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #a1a1aa;
          font-weight: 500;
        }

        .kpi-value {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .kpi-change {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .kpi-change.positive {
          color: #00cc88;
        }

        .kpi-change.negative {
          color: #ff4444;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-card {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .chart-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .chart-legend {
          display: flex;
          gap: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #a1a1aa;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-dot.viewers {
          background: var(--primary);
        }

        .legend-dot.unique {
          background: #00cc88;
        }

        .chart-container {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }

        .device-stats {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .device-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .device-icon {
          color: #a1a1aa;
        }

        .device-info {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .device-name {
          font-weight: 500;
        }

        .device-percentage {
          font-weight: 600;
          color: var(--primary);
        }

        .device-bar {
          width: 100px;
          height: 6px;
          background: #2d2e36;
          border-radius: 3px;
          overflow: hidden;
        }

        .device-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .geo-section {
          margin-bottom: 2rem;
        }

        .geo-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .geo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .geo-item {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .geo-flag {
          font-size: 1.5rem;
        }

        .geo-info {
          flex: 1;
        }

        .geo-country {
          display: block;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .geo-viewers {
          font-size: 0.8rem;
          color: #a1a1aa;
        }

        .geo-percentage {
          font-weight: 600;
          color: var(--primary);
        }

        .top-streams h3 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .streams-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stream-item {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stream-rank {
          width: 32px;
          height: 32px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .stream-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .stream-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: #a1a1aa;
        }

        @media (max-width: 768px) {
          .analytics-page {
            padding: 1rem;
          }

          .analytics-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

// Simple chart component
function ViewerChart({ data }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'end', 
      gap: '4px', 
      height: '100%',
      justifyContent: 'center'
    }}>
      {data?.slice(0, 7).map((item, index) => (
        <div
          key={index}
          style={{
            width: '20px',
            height: `${(item.viewers / Math.max(...data.map(d => d.viewers))) * 100}%`,
            background: index === data.length - 1 ? 'var(--primary)' : '#2d2e36',
            borderRadius: '2px',
            minHeight: '10px'
          }}
        />
      ))}
    </div>
  );
}