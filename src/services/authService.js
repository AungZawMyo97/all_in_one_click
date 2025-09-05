import CryptoJS from 'crypto-js';

// Credentials from environment variables
const USERNAME = process.env.REACT_APP_USERNAME || 'admin@oneclick.com';
const PASSWORD = process.env.REACT_APP_PASSWORD || 'mtz233981';

// Secret key for encryption from environment variable
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || 'oneclick_secret_key_2024_secure';

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.sessionToken = null;
  }

  // Encrypt sensitive data
  encrypt(text) {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  }

  // Decrypt sensitive data
  decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Generate session token
  generateSessionToken() {
    const timestamp = Date.now().toString();
    const randomString = Math.random().toString(36).substring(2);
    const tokenData = `${USERNAME}:${timestamp}:${randomString}`;
    return this.encrypt(tokenData);
  }

  // Validate session token
  validateSessionToken(token) {
    try {
      const decrypted = this.decrypt(token);
      const [username, timestamp] = decrypted.split(':');
      
      // Check if token is not older than 24 hours
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      return username === USERNAME && tokenAge < maxAge;
    } catch (error) {
      return false;
    }
  }

  // Login function
  login(username, password) {
    // Basic validation
    if (!username || !password) {
      return { success: false, message: 'Username and password are required' };
    }

    // Check credentials
    if (username === USERNAME && password === PASSWORD) {
      this.isAuthenticated = true;
      this.sessionToken = this.generateSessionToken();
      
      // Store in sessionStorage (encrypted)
      sessionStorage.setItem('oneclick_session', this.encrypt(this.sessionToken));
      sessionStorage.setItem('oneclick_auth', this.encrypt('true'));
      
      return { success: true, message: 'Login successful' };
    } else {
      return { success: false, message: 'Invalid credentials' };
    }
  }

  // Logout function
  logout() {
    this.isAuthenticated = false;
    this.sessionToken = null;
    sessionStorage.removeItem('oneclick_session');
    sessionStorage.removeItem('oneclick_auth');
  }

  // Check if user is authenticated
  checkAuth() {
    try {
      const encryptedAuth = sessionStorage.getItem('oneclick_auth');
      const encryptedSession = sessionStorage.getItem('oneclick_session');
      
      if (!encryptedAuth || !encryptedSession) {
        return false;
      }

      const isAuth = this.decrypt(encryptedAuth) === 'true';
      const sessionToken = this.decrypt(encryptedSession);
      
      if (isAuth && this.validateSessionToken(sessionToken)) {
        this.isAuthenticated = true;
        this.sessionToken = sessionToken;
        return true;
      } else {
        this.logout();
        return false;
      }
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // Get current session token
  getSessionToken() {
    return this.sessionToken;
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
