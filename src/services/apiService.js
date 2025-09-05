import axios from 'axios';

class ApiService {
  constructor() {
    // Configuration from environment variables
    this.telegramConfig = {
      botToken: process.env.REACT_APP_TELEGRAM_BOT_TOKEN || '',
      channelId: process.env.REACT_APP_TELEGRAM_CHANNEL_ID || '',
      apiUrl: 'https://api.telegram.org/bot'
    };
    
    this.viberConfig = {
      botToken: process.env.REACT_APP_VIBER_BOT_TOKEN || '',
      channelId: process.env.REACT_APP_VIBER_CHANNEL_ID || '',
      apiUrl: 'https://chatapi.viber.com/pa'
    };
  }

  // Post to Telegram channel
  async postToTelegram(message) {
    try {
      const url = `${this.telegramConfig.apiUrl}${this.telegramConfig.botToken}/sendMessage`;
      
      const response = await axios.post(url, {
        chat_id: this.telegramConfig.channelId,
        text: message,
        parse_mode: 'HTML'
      });

      if (response.data.ok) {
        return {
          success: true,
          message: 'Successfully posted to Telegram',
          data: response.data.result
        };
      } else {
        throw new Error(response.data.description || 'Failed to post to Telegram');
      }
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error.response?.data?.description) {
        errorMessage = error.response.data.description;
      } else if (error.response?.data?.error_code) {
        errorMessage = `Error ${error.response.data.error_code}: ${error.response.data.description || error.message}`;
      } else {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: `Telegram Error: ${errorMessage}`,
        error: error
      };
    }
  }

  // Post to Viber channel
  async postToViber(message) {
    try {
      // Try multiple CORS proxy services
      const proxyServices = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://thingproxy.freeboard.io/fetch/',
        'https://cors-anywhere.herokuapp.com/'
      ];
      
      for (let i = 0; i < proxyServices.length; i++) {
        try {
          const proxyUrl = proxyServices[i];
          let url, requestData, headers;
          
          if (proxyUrl.includes('allorigins.win')) {
            // allorigins.win requires different approach
            url = `${proxyUrl}${this.viberConfig.apiUrl}/post`;
            requestData = {
              auth_token: this.viberConfig.botToken,
              from: this.viberConfig.channelId,
              type: 'text',
              text: message
            };
            headers = {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            };
          } else {
            // Other proxies
            url = `${proxyUrl}${this.viberConfig.apiUrl}/post`;
            requestData = {
              auth_token: this.viberConfig.botToken,
              from: this.viberConfig.channelId,
              type: 'text',
              text: message
            };
            headers = {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            };
          }
          
          const response = await axios.post(url, requestData, {
            headers,
            timeout: 10000,
            withCredentials: false
          });

          if (response.data && response.data.status === 0) {
            return {
              success: true,
              message: 'Successfully posted to Viber',
              data: response.data
            };
          } else if (response.data && response.data.status) {
            throw new Error(response.data.status_message || 'Failed to post to Viber');
          }
        } catch (proxyError) {
          if (i === proxyServices.length - 1) {
            throw proxyError;
          }
        }
      }
      
      throw new Error('All CORS proxies failed for posting');
    } catch (error) {
      // If all proxies fail, try alternative approach
      return await this.postToViberAlternative(message);
    }
  }

  // Alternative Viber posting method (for CORS issues)
  async postToViberAlternative(message) {
    try {
      // Use fetch with CORS proxy
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = `${this.viberConfig.apiUrl}/post`;
      const url = `${proxyUrl}${targetUrl}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          auth_token: this.viberConfig.botToken,
          from: this.viberConfig.channelId,
          type: 'text',
          text: message
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 0) {
        return {
          success: true,
          message: 'Successfully posted to Viber',
          data: data
        };
      } else {
        throw new Error(data.status_message || 'Failed to post to Viber');
      }
    } catch (error) {
      return {
        success: false,
        message: `Viber Error: ${error.message}`,
        error: error
      };
    }
  }

  // Post to both channels
  async postToBothChannels(message) {
    const results = {
      telegram: null,
      viber: null,
      success: false,
      message: ''
    };

    try {
      // Post to both channels in parallel
      const [telegramResult, viberResult] = await Promise.allSettled([
        this.postToTelegram(message),
        this.postToViber(message)
      ]);

      results.telegram = telegramResult.status === 'fulfilled' ? telegramResult.value : {
        success: false,
        message: telegramResult.reason?.message || 'Telegram request failed'
      };

      results.viber = viberResult.status === 'fulfilled' ? viberResult.value : {
        success: false,
        message: viberResult.reason?.message || 'Viber request failed'
      };

      // Determine overall success
      const telegramSuccess = results.telegram.success;
      const viberSuccess = results.viber.success;

      if (telegramSuccess && viberSuccess) {
        results.success = true;
        results.message = 'Successfully posted to both Telegram and Viber channels';
      } else if (telegramSuccess || viberSuccess) {
        results.success = true;
        const successChannels = [];
        const failedChannels = [];
        
        if (telegramSuccess) successChannels.push('Telegram');
        else failedChannels.push('Telegram');
        
        if (viberSuccess) successChannels.push('Viber');
        else failedChannels.push('Viber');
        
        results.message = `Posted to ${successChannels.join(' and ')}. Failed to post to ${failedChannels.join(' and ')}.`;
      } else {
        results.success = false;
        results.message = 'Failed to post to both channels';
      }

      return results;
    } catch (error) {
      console.error('Posting Error:', error);
      results.success = false;
      results.message = `Error: ${error.message}`;
      return results;
    }
  }

  // Test connection to Telegram
  async testTelegramConnection() {
    try {
      const url = `${this.telegramConfig.apiUrl}${this.telegramConfig.botToken}/getMe`;
      
      const response = await axios.get(url);
      
      if (response.data.ok) {
        return {
          success: true,
          message: 'Telegram connection successful',
          botInfo: response.data.result
        };
      } else {
        throw new Error(response.data.description || 'Failed to connect to Telegram');
      }
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error.response?.data?.description) {
        errorMessage = error.response.data.description;
      } else if (error.response?.data?.error_code) {
        errorMessage = `Error ${error.response.data.error_code}: ${error.response.data.description || error.message}`;
      } else {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: `Telegram connection failed: ${errorMessage}`
      };
    }
  }

  // Test connection to Viber
  async testViberConnection() {
    try {
      // Try multiple CORS proxy services
      const proxyServices = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://thingproxy.freeboard.io/fetch/',
        'https://cors-anywhere.herokuapp.com/'
      ];
      
      for (let i = 0; i < proxyServices.length; i++) {
        try {
          const proxyUrl = proxyServices[i];
          let url, requestData, headers;
          
          if (proxyUrl.includes('allorigins.win')) {
            // allorigins.win requires different approach
            url = `${proxyUrl}${this.viberConfig.apiUrl}/get_account_info`;
            requestData = {
              auth_token: this.viberConfig.botToken
            };
            headers = {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            };
          } else {
            // Other proxies
            url = `${proxyUrl}${this.viberConfig.apiUrl}/get_account_info`;
            requestData = {
              auth_token: this.viberConfig.botToken
            };
            headers = {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            };
          }
          
          const response = await axios.post(url, requestData, {
            headers,
            timeout: 10000,
            withCredentials: false
          });
          
          if (response.data && response.data.status === 0) {
            return {
              success: true,
              message: 'Viber connection successful',
              botInfo: response.data
            };
          } else if (response.data && response.data.status) {
            throw new Error(response.data.status_message || 'Failed to connect to Viber');
          }
        } catch (proxyError) {
          if (i === proxyServices.length - 1) {
            throw proxyError;
          }
        }
      }
      
      throw new Error('All CORS proxies failed');
    } catch (error) {
      // If all proxies fail, try alternative approach
      return await this.testViberConnectionAlternative();
    }
  }

  // Alternative Viber connection test (for CORS issues)
  async testViberConnectionAlternative() {
    try {
      // Use fetch instead of axios to avoid CORS issues
      const response = await fetch(`${this.viberConfig.apiUrl}/get_account_info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          auth_token: this.viberConfig.botToken
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 0) {
        return {
          success: true,
          message: 'Viber connection successful',
          botInfo: data
        };
      } else {
        throw new Error(data.status_message || 'Failed to connect to Viber');
      }
    } catch (error) {
      return {
        success: false,
        message: `Viber connection failed: ${error.message}`
      };
    }
  }

  // Update configuration (for settings)
  updateTelegramConfig(botToken, channelId) {
    this.telegramConfig.botToken = botToken;
    this.telegramConfig.channelId = channelId;
  }

  updateViberConfig(botToken, channelId) {
    this.viberConfig.botToken = botToken;
    this.viberConfig.channelId = channelId;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
