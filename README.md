# Next.js WebXR Sneaker Customizer

A production-ready **Next.js** application featuring **React Three Fiber** for interactive 3D sneaker customization with **WebXR** support. This project demonstrates advanced 3D web development techniques and is optimized for both desktop and VR experiences.

## 🎯 Project Status: **PRODUCTION READY** ✅

- ✅ **Build**: Successfully compiles with no errors
- ✅ **Performance**: Optimized for 90fps VR performance
- ✅ **TypeScript**: Fully typed with proper error handling
- ✅ **WebXR**: Ready for VR/AR deployment
- ✅ **Responsive**: Works on desktop and mobile
- ✅ **Modern UI**: Girly pop aesthetic with professional polish

## 🛠️ Technologies Used

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with server-side rendering | 15.5.3 |
| **React** | UI library for building components | 19.1.0 |
| **React Three Fiber** | React renderer for Three.js | Latest |
| **@react-three/drei** | Useful helpers for R3F (OrbitControls, Grid, etc.) | Latest |
| **Three.js** | 3D graphics library | Latest |
| **TypeScript** | Static type checking | ^5 |
| **Tailwind CSS** | Utility-first CSS framework | ^4 |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ installed on your machine
- Basic knowledge of **HTML**, **CSS**, and **JavaScript**

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd next-react-three-fiber
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)


## ✨ Current Features

### 🎨 **3D Sneaker Customization**
- **Interactive Parts**: Click on any sneaker part to customize
- **Color Picker**: Modern right-side panel with 24 professional colors
- **Real-time Preview**: Instant color changes with smooth transitions
- **Hover Effects**: Visual feedback with pink highlights
- **Part Detection**: Automatic mesh recognition and naming

### 🎮 **User Controls**
- **Mouse Drag**: Rotate sneaker 360° horizontally and vertically
- **Scroll Zoom**: Scale from 1x to 20x with smooth limits
- **Shift + Drag**: Move sneaker position within bounds
- **Reset View**: One-click return to default position
- **Help UI**: Persistent on-screen instructions

### 🎨 **Visual Design**
- **Girly Pop Aesthetic**: Pink/mint color scheme with rounded corners
- **Professional Lighting**: 3-point studio lighting with HDRI environment
- **Contact Shadows**: Realistic grounding and depth
- **Smooth Animations**: 60fps+ performance with optimized materials
- **Modern UI**: Clean, accessible interface with proper contrast

### 🥽 **VR/XR Ready**
- **WebXR Integration**: Full VR/AR support with `@react-three/xr`
- **Controller Support**: Ray-based interaction for VR controllers
- **VR Optimized**: 90fps target performance for smooth VR experience
- **Hand Tracking**: Ready for hand tracking implementation

## 🚀 Deployment to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Deploy automatically with zero configuration

3. **Environment Setup:**
   - Next.js projects deploy automatically on Vercel
   - No additional configuration needed for this project

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Drei Documentation](https://github.com/pmndrs/drei)

### Learning Materials
- [React Three Fiber Journey](https://journey.pmnd.rs/) - Comprehensive R3F course
- [Three.js Journey](https://threejs-journey.com/) - Learn Three.js fundamentals
- [Next.js Learn](https://nextjs.org/learn) - Official Next.js tutorial

### WebXR Resources
- [WebXR Device API](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [React Three XR](https://github.com/pmndrs/react-xr) - WebXR for React Three Fiber