# Remotion Caption Studio

A full-stack video captioning platform built with React and Remotion. Upload MP4 videos, auto-generate captions with Hinglish support, and export captioned videos with multiple style presets.

## 🎯 Features

- **Video Upload**: Drag-and-drop MP4 video upload
- **Auto-Caption Generation**: AI-powered speech-to-text using OpenAI Whisper API
- **Hinglish Support**: Full support for Hindi (Devanagari), English, and mixed Hinglish text
- **Caption Style Presets**:
  - Bottom Subtitles (classic centered subtitles)
  - Top Bar (news-style banner)
  - Karaoke (progressive highlighting)
- **Real-Time Preview**: Live preview with Remotion Player
- **Export Functionality**: Render final video with embedded captions

## 🚀 Live Demo

[Your deployed URL here]

## 📦 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Video Engine**: Remotion (for caption overlay and rendering)
- **Backend**: Custom backend for API and storage
- **AI**: OpenAI Whisper API
- **Fonts**: Noto Sans, Noto Sans Devanagari, Inter

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd remotion-caption-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file and add any environment variables required for AI captioning or video processing.
   For OpenAI Whisper API integration, add:
   - `VITE_OPENAI_API_KEY`
   - Any other variables required for your custom backend/storage setup.

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:8080`

## 🎬 How to Use

1. **Upload Video**: Click or drag an MP4 video file to upload
2. **Generate Captions**: Click "Auto-Generate Captions" to transcribe audio
3. **Choose Style**: Select from 3 caption style presets
4. **Preview**: Watch real-time preview with captions
5. **Export**: Click "Export Video" to render the final captioned video

## 🌐 Deployment

### Deploy to Vercel

1. **Connect GitHub Repository**
   - Push your code to GitHub
   - Import repository in Vercel dashboard

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add Environment Variables**
   
   Add any required environment variables (such as OpenAI keys, backend URLs, etc.) to your Vercel project settings.

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `your-app.vercel.app`

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── VideoUploader.tsx      # Video upload interface
│   │   ├── CaptionEditor.tsx      # Caption style selector
│   │   ├── VideoPreview.tsx       # Remotion player preview
│   │   └── ui/                    # shadcn/ui components
│   ├── remotion/
│   │   ├── VideoComposition.tsx   # Remotion video component
│   │   └── Root.tsx               # Remotion root
│   ├── pages/
│   │   └── Index.tsx              # Main app page
├── remotion.config.ts             # Remotion configuration
└── tailwind.config.ts             # Design system configuration
```

## 🔧 Caption Generation Method

The app uses **OpenAI Whisper API** for speech-to-text transcription:

- **Model**: `whisper-1` (OpenAI's production Whisper model)
- **Features**: 
  - Word-level and segment-level timestamps
  - Multi-language support (English, Hindi, and mixed)
  - High accuracy for various accents and audio quality
- **Implementation**: Server-side endpoint (`generate-captions`) which handles AI transcription
- **Security**: API keys managed via environment variables or secure secrets

## 🎨 Design System

The app uses a professional dark theme optimized for video editing:

- **Primary Color**: Cyan/Teal gradient (`hsl(187 85% 55%)`)
- **Background**: Dark slate (`hsl(240 10% 3.9%)`)
- **Typography**: Inter, Noto Sans, Noto Sans Devanagari
- **Components**: Custom shadcn/ui variants with design tokens
- **Animations**: Smooth transitions with cubic-bezier easing

## 🔐 Security & Storage

- **Video Storage**: Videos are stored using your configured storage provider (e.g., cloud storage, object storage, etc.)
- **API Keys**: Securely stored in environment variables or project secrets
- **CORS**: Enabled for backend endpoint access

## 📝 Sample Output

Sample videos are available in the `/samples` directory (add your sample videos there):
- `input-video.mp4` - Original video
- `output-captioned.mp4` - Video with generated captions

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- [Remotion](https://remotion.dev) - Video rendering framework
- [OpenAI Whisper](https://openai.com/research/whisper) - Speech recognition model
- [shadcn/ui](https://ui.shadcn.com) - UI component library

## 📞 Support

For issues or questions:
- Open a GitHub issue
- Check the [Remotion documentation](https://remotion.dev/docs)
- Check the [OpenAI Whisper documentation](https://platform.openai.com/docs/guides/speech-to-text)
