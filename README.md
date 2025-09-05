# One Click - Post to Telegram and Viber

A React application that allows you to post messages to both Telegram and Viber channels with a single click.

## Features

- 🔐 Secure authentication with hardcoded credentials
- 📱 Post to Telegram channels
- 💬 Post to Viber channels
- 🛡️ Security measures to prevent inspection and injection
- 🎨 Modern, responsive UI
- ⚡ Real-time connection testing

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file** with your actual credentials:
   ```env
   REACT_APP_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   REACT_APP_TELEGRAM_CHANNEL_ID=your_telegram_channel_id
   REACT_APP_VIBER_BOT_TOKEN=your_viber_bot_token
   REACT_APP_VIBER_CHANNEL_ID=your_viber_channel_id
   REACT_APP_SECRET_KEY=your_secret_key
   ```



## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Telegram Bot

1. Create a new bot by messaging [@BotFather](https://t.me/botfather) on Telegram
2. Get your bot token
3. Add your bot to your Telegram channel as an admin
4. Get your channel username or ID

### 3. Configure Viber Bot

1. Create a Viber bot at [Viber Bot Platform](https://partners.viber.com/)
2. Get your bot token
3. Get your channel ID

### 4. Update Configuration

Edit `src/services/apiService.js` and update the following:

```javascript
this.telegramConfig = {
  botToken: 'YOUR_TELEGRAM_BOT_TOKEN', // Replace with your actual bot token
  channelId: '@YOUR_TELEGRAM_CHANNEL', // Replace with your actual channel username or ID
  apiUrl: 'https://api.telegram.org/bot'
};

this.viberConfig = {
  botToken: 'YOUR_VIBER_BOT_TOKEN', // Replace with your actual bot token
  apiUrl: 'https://chatapi.viber.com/pa'
};
```

### 5. Run the Application

```bash
npm start
```

The application will open at `http://localhost:3000`

## Security Features

- Encrypted session storage
- Disabled right-click context menu
- Disabled developer tools shortcuts (F12, Ctrl+Shift+I, etc.)
- Disabled text selection
- Session token validation with expiration
- Secure credential storage

## Usage

1. Login with the provided credentials
2. Type your message in the text area
3. Click "Post to Both Channels" to send to both Telegram and Viber
4. Use "Test Connections" to verify your bot configurations
5. Use "Logout" to end your session

## File Structure

```
src/
├── components/
│   ├── Login.js          # Login component
│   └── PostForm.js       # Main posting interface
├── services/
│   ├── authService.js    # Authentication service
│   └── apiService.js     # API integration service
├── App.js                # Main app component
├── index.js              # App entry point
└── index.css             # Global styles
```

## API Endpoints Used

- **Telegram:** `https://api.telegram.org/bot{token}/sendMessage`
- **Viber:** `https://chatapi.viber.com/pa/send_message`

## Troubleshooting

### Telegram Issues
- Ensure your bot token is correct
- Make sure your bot is added to the channel as an admin
- Verify the channel ID/username is correct

### Viber Issues
- Ensure your bot token is correct
- Verify your Viber bot is properly configured
- Check that the channel ID is correct

### Connection Issues
- Use the "Test Connections" button to diagnose problems
- Check your internet connection
- Verify API endpoints are accessible

## Security Features

- **Environment Variables**: All sensitive data is stored in `.env` file
- **Git Protection**: `.env` file is excluded from version control
- **Encrypted Sessions**: All session data is encrypted before storage
- **Token Expiration**: Session tokens expire after 24 hours
- **Inspection Protection**: Developer tools and right-click are disabled
- **Secure Storage**: Sensitive data is encrypted with AES encryption

## Security Notes

- **Never commit `.env` file** to version control
- **Use strong passwords** and secret keys in production
- **Rotate credentials** regularly for enhanced security
- **Environment variables** are the recommended way to store sensitive data

## License

This project is for educational and personal use.
