# AgroLLM - Agricultural AI Assistant

AgroLLM is an intelligent agricultural assistant that helps farmers and agricultural enthusiasts get answers to their farming questions. The application uses advanced AI technology to provide reliable information about crops, weather, soil conditions, and farming practices.

## What Does This Application Do?

This platform serves as a virtual agricultural advisor where users can:

- Ask farming-related questions in their preferred language
- Upload images of crops or plants for analysis
- Get weather forecasts for their location
- Receive soil analysis and crop recommendations
- Check current crop prices and market trends
- Access expert analysis for detailed agricultural insights
- Use voice input for asking questions

## Key Features

### Smart Question Answering
The system understands agricultural questions and provides accurate answers based on a large database of farming knowledge. It can handle follow-up questions and remembers your conversation history.

### Multiple Language Support
Users can interact with the application in any of these languages:
- English, Hindi, Bengali, Telugu, Marathi, Tamil
- Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu

### Image Analysis
Upload photos of your crops or plants to get:
- Disease identification
- Pest detection
- Growth stage analysis
- Treatment recommendations

### Real-Time Weather Data
Get 15-day weather forecasts for any location to plan your farming activities better.

### Expert Analysis Mode
Access detailed expert-level analysis twice per day for complex agricultural queries. This feature provides in-depth insights with approximately 400 words of detailed information.

### Voice Input
Record your questions using voice input instead of typing. The system converts your speech to text and processes your query.

## Technology Stack

### Frontend
- React.js for the user interface
- React Router for navigation
- Axios for API communication
- React Icons for visual elements
- React Markdown for formatted responses

### Backend
- Node.js with Express.js
- MongoDB for data storage
- Passport.js for Google OAuth authentication
- JWT for secure authentication
- Multer for file uploads
- Cloudinary for image storage

### AI Components
- Mistral-7B language model for generating responses
- Google Gemini AI for image analysis and dynamic recommendations
- FAISS vector database for efficient information retrieval
- HuggingFace Sentence Transformers for text embeddings
- LangChain for orchestrating AI workflows

### Additional Technologies
- Python scripts for ML model inference
- Speech recognition for voice input
- Language detection for multilingual support
- FFmpeg for audio processing

## Project Structure

```
AGRO_LLM/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── contexts/      # React context providers
│   │   └── App.js         # Main application component
│   └── public/            # Static files
│
├── server/                # Node.js backend
│   ├── controllers/       # Request handlers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API endpoints
│   ├── middleware/       # Authentication & error handling
│   ├── config/           # Database and passport configuration
│   └── server.js         # Server entry point
│
└── agrollm.ipynb         # Jupyter notebook with ML models
```

## How to Set Up

### Prerequisites
You need to have the following installed on your computer:
- Node.js (version 14 or higher)
- MongoDB database
- Python (version 3.8 or higher)
- CUDA-enabled GPU (recommended for ML models)

### Environment Variables

Create a `.env` file in the server folder with these settings:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GEMINI_API_KEY=your_gemini_api_key
GRADIO_URL=your_gradio_deployment_url
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AGRO_LLM
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Install Python dependencies**
   ```bash
   pip install transformers accelerate langchain langchain-community faiss-cpu sentence-transformers pymupdf SpeechRecognition google-generativeai langdetect deep_translator torch gradio
   ```

5. **Start MongoDB**
   Make sure your MongoDB service is running.

6. **Run the backend server**
   ```bash
   cd server
   npm start
   ```

7. **Run the frontend**
   ```bash
   cd client
   npm start
   ```

The application should now be running at `http://localhost:3000`

## How to Use

### For Regular Users

1. **Sign Up or Login**
   - Create an account using email and password
   - Or login with your Google account

2. **Start a Chat**
   - Click on "New Chat" to begin
   - Type your agricultural question in any supported language
   - You can also click the microphone icon to use voice input

3. **Upload Images** (Optional)
   - Click the image icon to upload a photo
   - You can upload up to 4 images per chat
   - The system will analyze the images along with your question

4. **Get Expert Analysis**
   - Click the "Expert Analysis" button for detailed responses
   - You can use this feature twice per day
   - It provides comprehensive information about your query

5. **View History**
   - All your previous chats are saved
   - Click on any chat from the sidebar to continue the conversation

### For Administrators

Administrators have access to a special dashboard where they can:
- View all registered users
- Monitor user activity and chat statistics
- Block or timeout users if needed
- Review feedback submitted by users
- Manage system settings

## API Endpoints

The application provides these main API routes:

### User Routes (`/api/users`)
- Register new users
- Login existing users
- Get user profile information

### Chat Routes (`/api/chats`)
- Create new chat sessions
- Get all chats for a user
- Update chat messages
- Delete specific chats
- Get predictions for questions
- Upload and manage images
- Get expert analysis

### Audio Routes (`/api/audio`)
- Transcribe voice recordings to text

### Auth Routes (`/api/auth`)
- Google OAuth authentication
- Refresh authentication tokens

### Admin Routes (`/api/admin`)
- Get all users (admin only)
- Block or unblock users
- Set user timeouts
- View system statistics

### Feedback Routes (`/api/feedback`)
- Submit user feedback
- View all feedback (admin only)

## Machine Learning Models

The application uses several AI models:

1. **Mistral-7B-Instruct-v0.2**
   - Main language model for generating responses
   - Processes agricultural knowledge base
   - Provides context-aware answers

2. **Sentence Transformers (all-MiniLM-L6-v2)**
   - Creates embeddings for text similarity
   - Powers the semantic search functionality

3. **Google Gemini AI**
   - Handles image analysis
   - Provides dynamic crop and soil recommendations
   - Generates price predictions

4. **FAISS Vector Database**
   - Stores and retrieves agricultural knowledge
   - Enables fast similarity search across documents

## Important Features

### Session Management
Each chat session is tracked separately, allowing the system to maintain conversation context and provide relevant follow-up responses.

### Rate Limiting
Expert analysis is limited to 2 uses per day per user to ensure fair usage and system performance.

### Multilingual Support
The system automatically detects the language of your input and responds in the same language for better user experience.

### Data Caching
Weather, soil, and crop data are cached to reduce API calls and improve response times.

### Security Features
- Passwords are encrypted using bcrypt
- JWT tokens for secure authentication
- Session management with express-session
- Google OAuth for secure third-party login

## Troubleshooting

### Common Issues

**Problem**: Server won't start
- Solution: Check if MongoDB is running and the connection string is correct in your .env file

**Problem**: AI responses are slow
- Solution: Make sure you have a GPU available, or reduce the model size in the configuration

**Problem**: Voice input not working
- Solution: Ensure your browser has microphone permissions enabled

**Problem**: Images not uploading
- Solution: Check that Cloudinary credentials are correctly configured

**Problem**: Authentication failing
- Solution: Verify your JWT_SECRET and Google OAuth credentials in the .env file

## Contributing

If you want to improve this application:
1. Fork the repository
2. Create a new branch for your feature
3. Make your changes and test thoroughly
4. Submit a pull request with a clear description

## Database Models

### User Model
Stores user information including email, password, role (user/admin), expert analysis usage count, language preferences, and account status.

### Chat Model
Maintains chat history with messages, session IDs, language preference, and timestamps.

### Feedback Model
Records user feedback with ratings, comments, and submission timestamps.

### Image Model
Stores uploaded images with metadata, linked to specific chat sessions.

## Performance Optimization

The application includes several optimizations:
- Concurrent request processing (up to 5 parallel requests)
- Response caching for frequently accessed data
- Lazy loading of ML models
- Efficient vector search using FAISS
- Image compression and CDN delivery

## Future Enhancements

Potential improvements for future versions:
- Mobile application development
- Offline mode support
- Video upload and analysis
- Real-time crop disease alerts
- Integration with more weather APIs
- Expanded language support
- Community forum for farmers
- Marketplace for agricultural products

## Support

For questions or support, please check the existing documentation or reach out through the feedback feature in the application.

## Acknowledgments

This project uses several open-source technologies and APIs:
- Mistral AI for language models
- HuggingFace for model hosting
- Google Gemini for AI services
- Open-Meteo for weather data
- MongoDB for database services
- React and Node.js communities


