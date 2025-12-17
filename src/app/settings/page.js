'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  User, Lock, CreditCard, Radio, Mail, Bell, Palette,
  ChevronDown, Check, X, Eye, EyeOff, Copy, RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  const [settings, setSettings] = useState({
    email: session?.user?.email || 'user@example.com',
    username: session?.user?.name || 'username',
    timezone: 'Europe/Brussels (+01:00)',
    language: 'English',
    emailNotifications: true,
    streamAlerts: true,
    marketingEmails: false,
    brandColor: '#5c4dff',
    streamKey: 'live_xxxxxxxxxxxxxxxxxxxxxxxx',
    rtmpUrl: 'rtmp://live.streamit.com/live'
  });

  const tabs = [
    { id: 'account', label: 'ACCOUNT', icon: User },
    { id: 'password', label: 'PASSWORD', icon: Lock },
    { id: 'billing', label: 'BILLING', icon: CreditCard },
    { id: 'stream', label: 'STREAM SETUP', icon: Radio },
    { id: 'email', label: 'EMAIL SETTINGS', icon: Mail },
    { id: 'alerts', label: 'SOCIAL ALERTS', icon: Bell },
    { id: 'branding', label: 'BRANDING', icon: Palette }
  ];

  const timezones = [
    'Europe/Brussels (+01:00)',
    'Europe/London (+00:00)',
    'America/New_York (-05:00)',
    'America/Los_Angeles (-08:00)',
    'Asia/Tokyo (+09:00)',
    'Australia/Sydney (+11:00)'
  ];


  const generateNewStreamKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'live_';
    for (let i = 0; i < 24; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSettings(prev => ({ ...prev, streamKey: key }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="settings-page">
      {/* Sidebar */}
      <aside className="settings-sidebar">
        <div className="user-section">
          <div className="user-avatar">
            {session?.user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{session?.user?.name || 'User'}</span>
            <span className="user-plan">Free plan</span>
          </div>
          <ChevronDown size={16} />
        </div>

        <button className="invite-btn">
          <User size={16} />
          Invite members
        </button>

        <div className="workspaces">
          <div className="workspace-header">
            <span>Workspaces</span>
            <button className="add-btn">+ Add</button>
          </div>
          <div className="workspace-item active">
            <div className="workspace-icon">R</div>
            <span>Default</span>
            <ChevronDown size={14} />
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className="nav-item">🏠 Home</Link>
          <Link href="/analytics" className="nav-item">📊 Analytics</Link>
          <Link href="/settings" className="nav-item active">⚙️ Settings</Link>
        </nav>

        <div className="sidebar-footer">
          <div className="footer-links">
            <a href="#">Pricing</a>
            <a href="#">Help Center</a>
            <a href="#">Changelog</a>
          </div>
          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">About</a>
          </div>
        </div>
      </aside>


      {/* Main Content */}
      <main className="settings-main">
        <h1>Settings</h1>

        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="settings-content">
          {activeTab === 'account' && (
            <div className="tab-content">
              <div className="section">
                <h3>Two-factor authentication (2FA)</h3>
                <p className="description">
                  Two-factor authentication (2FA) adds additional account security if your password 
                  is compromised or stolen. With 2FA, access to your account requires a password 
                  and a second form of verification.
                </p>
                <p className="description">
                  Streamit supports 2FA by using one-time passwords generated with the TOTP algorithm. 
                  You can use any mobile application employing TOTP.
                </p>
                <p className="description">
                  We recommend the following apps:<br />
                  Android, iOS, and Blackberry—<a href="#">Google Authenticator</a><br />
                  Windows Phone—<a href="#">Authenticator</a>
                </p>
                <button 
                  className={`btn-primary ${twoFactorEnabled ? 'enabled' : ''}`}
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                >
                  {twoFactorEnabled ? 'Disable' : 'Enable'} Two-factor Authentication
                </button>
              </div>

              <div className="section">
                <h3>Email</h3>
                <p className="current-value">{settings.email}</p>
                <button className="btn-primary">Change</button>
              </div>

              <div className="section">
                <h3>Username</h3>
                <input
                  type="text"
                  value={settings.username}
                  onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                  className="input-field"
                />
                <button className="btn-primary">Change</button>
              </div>

              <div className="section">
                <h3>Timezone</h3>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                  className="select-field"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div className="section danger-zone">
                <h3>Danger Zone</h3>
                <button className="btn-danger">Delete Account</button>
              </div>
            </div>
          )}


          {activeTab === 'password' && (
            <div className="tab-content">
              <div className="section">
                <h3>Change Password</h3>
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="password-input">
                    <input type={showPassword ? 'text' : 'password'} placeholder="Enter current password" />
                    <button onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" />
                </div>
                <button className="btn-primary">Update Password</button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="tab-content">
              <div className="section">
                <h3>Current Plan</h3>
                <div className="plan-card">
                  <div className="plan-info">
                    <h4>Free Plan</h4>
                    <p>Basic streaming features</p>
                  </div>
                  <button className="btn-upgrade">Upgrade to Pro</button>
                </div>
              </div>
              <div className="section">
                <h3>Payment Method</h3>
                <p className="description">No payment method on file</p>
                <button className="btn-primary">Add Payment Method</button>
              </div>
              <div className="section">
                <h3>Billing History</h3>
                <p className="description">No billing history available</p>
              </div>
            </div>
          )}

          {activeTab === 'stream' && (
            <div className="tab-content">
              <div className="section">
                <h3>Stream Key</h3>
                <p className="description">Use this key to connect your streaming software (OBS, etc.)</p>
                <div className="key-display">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={settings.streamKey} 
                    readOnly 
                  />
                  <button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button onClick={() => copyToClipboard(settings.streamKey)}>
                    <Copy size={16} />
                  </button>
                  <button onClick={generateNewStreamKey}>
                    <RefreshCw size={16} />
                  </button>
                </div>
                <p className="warning">⚠️ Never share your stream key with anyone!</p>
              </div>
              <div className="section">
                <h3>RTMP URL</h3>
                <div className="key-display">
                  <input type="text" value={settings.rtmpUrl} readOnly />
                  <button onClick={() => copyToClipboard(settings.rtmpUrl)}>
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}


          {activeTab === 'email' && (
            <div className="tab-content">
              <div className="section">
                <h3>Email Notifications</h3>
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>Stream notifications</span>
                    <input 
                      type="checkbox" 
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, emailNotifications: e.target.checked 
                      }))}
                    />
                  </label>
                  <label className="toggle-label">
                    <span>Marketing emails</span>
                    <input 
                      type="checkbox" 
                      checked={settings.marketingEmails}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, marketingEmails: e.target.checked 
                      }))}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="tab-content">
              <div className="section">
                <h3>Social Alerts</h3>
                <p className="description">Configure alerts for your stream</p>
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>New follower alerts</span>
                    <input type="checkbox" checked={settings.streamAlerts} onChange={() => {}} />
                  </label>
                  <label className="toggle-label">
                    <span>Donation alerts</span>
                    <input type="checkbox" checked={true} onChange={() => {}} />
                  </label>
                  <label className="toggle-label">
                    <span>Subscriber alerts</span>
                    <input type="checkbox" checked={true} onChange={() => {}} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="tab-content">
              <div className="section">
                <h3>Brand Color</h3>
                <div className="color-picker">
                  <input 
                    type="color" 
                    value={settings.brandColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, brandColor: e.target.value }))}
                  />
                  <span>{settings.brandColor}</span>
                </div>
              </div>
              <div className="section">
                <h3>Logo</h3>
                <div className="upload-area">
                  <p>Drag and drop your logo here or click to upload</p>
                  <button className="btn-primary">Upload Logo</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Help Button */}
      <button className="help-btn">
        Need<br />help?
      </button>


      <style jsx>{`
        .settings-page {
          display: flex;
          min-height: 100vh;
          background: #09090b;
          color: white;
        }

        .settings-sidebar {
          width: 200px;
          background: #121215;
          border-right: 1px solid rgba(255,255,255,0.1);
          padding: 1rem;
          display: flex;
          flex-direction: column;
        }

        .user-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          margin-bottom: 1rem;
          cursor: pointer;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: #5c4dff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          display: block;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-plan {
          display: block;
          font-size: 0.75rem;
          color: #666;
        }

        .invite-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid #333;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        .invite-btn:hover {
          background: rgba(255,255,255,0.05);
        }

        .workspaces {
          margin-bottom: 1.5rem;
        }

        .workspace-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .add-btn {
          background: transparent;
          border: none;
          color: #5c4dff;
          cursor: pointer;
          font-size: 0.75rem;
        }

        .workspace-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .workspace-item.active {
          background: rgba(92, 77, 255, 0.1);
        }

        .workspace-icon {
          width: 24px;
          height: 24px;
          background: #5c4dff;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
        }

        .sidebar-nav {
          flex: 1;
        }

        .nav-item {
          display: block;
          padding: 0.5rem;
          color: #999;
          text-decoration: none;
          font-size: 0.85rem;
          border-radius: 6px;
          margin-bottom: 0.25rem;
        }

        .nav-item:hover, .nav-item.active {
          background: rgba(255,255,255,0.05);
          color: white;
        }

        .sidebar-footer {
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .footer-links {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .footer-links a {
          color: #666;
          text-decoration: none;
          font-size: 0.75rem;
        }

        .footer-links a:hover {
          color: white;
        }

        .settings-main {
          flex: 1;
          padding: 2rem 3rem;
          max-width: 900px;
        }

        .settings-main h1 {
          font-size: 1.5rem;
          margin: 0 0 1.5rem 0;
        }

        .settings-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 2rem;
        }

        .tab {
          background: transparent;
          border: none;
          color: #666;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab:hover {
          color: white;
        }

        .tab.active {
          color: white;
          border-bottom-color: #5c4dff;
        }

        .settings-content {
          max-width: 600px;
        }

        .tab-content {
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .section h3 {
          font-size: 0.9rem;
          margin: 0 0 0.5rem 0;
          color: white;
        }

        .description {
          color: #999;
          font-size: 0.85rem;
          line-height: 1.6;
          margin: 0 0 1rem 0;
        }

        .description a {
          color: #5c4dff;
          text-decoration: underline;
        }

        .current-value {
          color: #ccc;
          font-size: 0.9rem;
          margin: 0 0 1rem 0;
        }

        .btn-primary {
          background: #5c4dff;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #4c3dff;
        }

        .btn-primary.enabled {
          background: #22c55e;
        }

        .btn-danger {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .btn-upgrade {
          background: linear-gradient(135deg, #5c4dff, #8b5cf6);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .input-field, .select-field {
          width: 100%;
          max-width: 300px;
          background: #1a1a1f;
          border: 1px solid #333;
          color: white;
          padding: 0.6rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .input-field:focus, .select-field:focus {
          outline: none;
          border-color: #5c4dff;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          color: #999;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }

        .form-group input {
          width: 100%;
          max-width: 300px;
          background: #1a1a1f;
          border: 1px solid #333;
          color: white;
          padding: 0.6rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .password-input {
          display: flex;
          gap: 0.5rem;
          max-width: 300px;
        }

        .password-input input {
          flex: 1;
        }

        .password-input button {
          background: #333;
          border: none;
          color: #999;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
        }

        .key-display {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .key-display input {
          flex: 1;
          background: #1a1a1f;
          border: 1px solid #333;
          color: white;
          padding: 0.6rem 1rem;
          border-radius: 6px;
          font-family: monospace;
        }

        .key-display button {
          background: #333;
          border: none;
          color: #999;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
        }

        .key-display button:hover {
          background: #444;
          color: white;
        }

        .warning {
          color: #f59e0b;
          font-size: 0.8rem;
        }

        .plan-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #1a1a1f;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #333;
        }

        .plan-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
        }

        .plan-info p {
          margin: 0;
          color: #666;
          font-size: 0.85rem;
        }

        .toggle-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .toggle-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #1a1a1f;
          border-radius: 6px;
          cursor: pointer;
        }

        .toggle-label input[type="checkbox"] {
          width: 40px;
          height: 20px;
          accent-color: #5c4dff;
        }

        .color-picker {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .color-picker input[type="color"] {
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .upload-area {
          border: 2px dashed #333;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
        }

        .upload-area p {
          color: #666;
          margin: 0 0 1rem 0;
        }

        .danger-zone {
          border-color: rgba(220, 38, 38, 0.3);
        }

        .help-btn {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: #333;
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.75rem;
          cursor: pointer;
          line-height: 1.3;
        }

        .help-btn:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}