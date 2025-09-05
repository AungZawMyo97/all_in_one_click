import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const PostForm = ({ onLogout }) => {
  const [formData, setFormData] = useState({
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [channelStatus, setChannelStatus] = useState({
    telegram: null,
    viber: null
  });

  useEffect(() => {
    // Test connections on component mount
    testConnections();
  }, []);

  const testConnections = async () => {
    const [telegramResult, viberResult] = await Promise.all([
      apiService.testTelegramConnection(),
      apiService.testViberConnection()
    ]);

    setChannelStatus({
      telegram: telegramResult,
      viber: viberResult
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear status when user starts typing
    if (status) setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter a message to post'
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const result = await apiService.postToBothChannels(formData.message);
      
      setStatus({
        type: result.success ? 'success' : 'error',
        message: result.message
      });

      // Update channel status based on results
      if (result.telegram) {
        setChannelStatus(prev => ({
          ...prev,
          telegram: result.telegram
        }));
      }
      
      if (result.viber) {
        setChannelStatus(prev => ({
          ...prev,
          viber: result.viber
        }));
      }

      // Clear form if successful
      if (result.success) {
        setFormData({ message: '' });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  const getChannelStatusClass = (channelResult) => {
    if (!channelResult) return 'inactive';
    return channelResult.success ? 'active' : 'inactive';
  };

  const getChannelStatusText = (channelResult) => {
    if (!channelResult) return 'Not tested';
    return channelResult.success ? 'Connected' : 'Disconnected';
  };

  return (
    <div className="container">
      <div className="card post-form">
        <div className="header">
          <h1>
            <div className="header-logo">
              <img src="/one_click.png" alt="One Click Logo" />
            </div>
            One Click
          </h1>
          <p>Post to your Telegram and Viber channels</p>
        </div>

        {/* Channel Status */}
        <div className="channel-status">
          <div className={`channel-item ${getChannelStatusClass(channelStatus.telegram)}`}>
            <div className="channel-logo telegram-logo">
              <i className="fab fa-telegram-plane"></i>
            </div>
            <div className="channel-name">Telegram</div>
            <div className="channel-status-text">
              {getChannelStatusText(channelStatus.telegram)}
            </div>
          </div>
          <div className={`channel-item ${getChannelStatusClass(channelStatus.viber)}`}>
            <div className="channel-logo viber-logo">
              <i className="fab fa-viber"></i>
            </div>
            <div className="channel-name">Viber</div>
            <div className="channel-status-text">
              {getChannelStatusText(channelStatus.viber)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="message">Your Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Type your message here..."
              required
              maxLength={4000}
            />
            <small style={{ color: '#666', fontSize: '0.9rem' }}>
              {formData.message.length}/4000 characters
            </small>
          </div>

          {status && (
            <div className={`status ${status.type}`}>
              {status.message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn"
              disabled={loading}
            >
              {loading && <span className="loading"></span>}
              {loading ? 'Posting...' : 'Post to Both Channels'}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={testConnections}
              disabled={loading}
            >
              Test Connections
            </button>
            
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostForm;
