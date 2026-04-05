# VoyageAI  
AI-Powered Trip Planning Platform  

---

## Badges  
![Build](https://img.shields.io/badge/build-passing-brightgreen)  
![License](https://img.shields.io/badge/license-MIT-blue)  
![Language](https://img.shields.io/badge/language-TypeScript-blue)  
![Last Commit](https://img.shields.io/badge/last%20commit-recent-orange)  

---

## Overview  
VoyageAI is a full-stack AI travel planner that generates personalized itineraries through a chat interface.

You enter your travel preferences. The system generates structured multi-day plans with activities, hotels, and map-based visualization.

The platform uses a serverless backend and managed services to deliver fast and scalable performance without complex infrastructure.

---

## Features  

- Conversational AI chatbot for trip planning  
- Multi-day itinerary generation with activities  
- AI-powered recommendations using LLMs  
- Minimum 3 hotel suggestions per trip  
- Interactive map with activity markers  
- User authentication and saved trips  
- Rate limiting for backend protection  
- Clean and responsive UI  

---

## Demo  

- Live App:   
- Demo Video:   
- Project Website:   

---

## Tech Stack  

Frontend  
- Next.js  
- React  
- TypeScript  
- Tailwind CSS  
- ShadCN UI  

Backend  
- Convex (serverless database and functions)  

AI  
- OpenRouter (LLM integration)  

Maps  
- Mapbox GL  

Authentication  
- Clerk  

Other Services  
- Arcjet (rate limiting)  

Deployment  
- Add your hosting platform here  

---

## Architecture  

High-level flow  

User → Domain → Hosting Platform → Next.js App  

External integrations  

- Convex handles backend logic and database  
- OpenRouter generates AI itineraries  
- Mapbox provides location data  
- Arcjet enforces request limits  
- Clerk manages authentication  

Key decisions  

- Serverless backend reduces operational overhead  
- Managed services handle scaling automatically  
- Simple architecture improves maintainability  
- Focus on product features over infrastructure complexity  

---

## Setup  

### Prerequisites  

- Node.js 18+  
- npm or yarn  
- Convex account  
- Clerk account  
- Mapbox API key  

---

### Environment Variables  

Create `.env.local`  

CONVEX_DEPLOYMENT=your_key  
NEXT_PUBLIC_CONVEX_URL=your_url  
GROQ_API_KEY=your_key  

Create `.env`  

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key  
CLERK_SECRET_KEY=your_key  
ARCJET_KEY=your_key  
GOOGLE_PLACE_API_KEY=your_key  
NEXT_PUBLIC_MAPBOX_API_KEY=your_key  

---

## Usage  

Example flow  

1. Sign up or log in  
2. Enter trip details in chat  
3. Receive generated itinerary  
4. View activities on the map  
5. Save trips for later  

---

## How to Run  

npm install  
npx convex dev  
npm run dev  

Open http://localhost:3000  

---

## Contributing  

1. Fork the repository  
2. Create a feature branch  
3. Commit changes  
4. Open a pull request  

---

## License  

MIT License  

---

## Contact  

Pritam Paul  
Email: pritampaul.10000@gmail.com  
GitHub: https://github.com/pritampaul00

