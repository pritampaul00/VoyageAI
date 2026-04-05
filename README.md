# VoyageAI:  AI-Powered Trip Planning Platform  

VoyageAI is a **full-stack AI travel planning platform** that generates personalized travel itineraries through a conversational chat interface. The project combines **AI-powered itinerary generation, real-time backend infrastructure, interactive mapping, and a modern frontend**, while being deployed using a **production-style DevOps pipeline with Docker and GitHub Actions**.

---

## Live Demo  

- Live App: https://voyage-ai-nine.vercel.app/
  
---

## Core Features  

- Conversational AI chatbot for trip planning  
- Multi-day itinerary generation with activities  
- AI-powered recommendations using LLMs  
- Minimum 3 hotel suggestions per trip  
- Interactive map with activity markers  
- User authentication and saved trips  
- Rate limiting for backend protection  
- Clean and responsive UI  

---

## System Architecture  

### Application Architecture  

```
User
↓
Domain (roamifyai.tech)
↓
Hosting Platform
↓
Next.js Full Stack App
```

### External Services  

```
Next.js App → Arcjet (Rate Limiting)
Next.js App → Convex (Database + Backend)
Next.js App → OpenRouter (AI Generation)
Next.js App → Mapbox / Google Maps (Location Data)
```
---

## Tech Stack  

| Layer            | Technologies |
|------------------|-------------|
| Frontend         | Next.js, React, TypeScript, TailwindCSS, ShadCN UI |
| Backend          | Convex (Serverless Database + Backend Functions) |
| AI               | OpenRouter (LLM Integration) |
| Maps             | Mapbox GL |
| Authentication   | Clerk |
| Rate Limiting    | Arcjet |
| CI/CD            | GitHub Actions |

---

## DevOps Architecture

VoyageAI uses a **modern DevOps workflow** focused on automation and fast deployment.

Tools used:

- GitHub Actions, CI and CD automation  
- Hosting platform, application deployment  
- Docker, optional containerization
  
---

## CI/CD Pipeline  

The deployment pipeline is automated using **GitHub Actions**.

### Pipeline workflow  

1. Developer pushes code to GitHub  
2. GitHub Actions workflow starts  
3. Dependencies are installed  
4. Application build is created  
5. Linting or basic checks run  
6. Deployment step executes  
7. Application updates live
---

## Environment Variables  

Create `.env.local`

```
CONVEX_DEPLOYMENT=<convex_deployment_key>
NEXT_PUBLIC_CONVEX_URL=<convex_deployment_url>
OPENROUTER_API_KEY=<openrouter_api_key>
```

Create `.env`

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<clerk_publishable_key>
CLERK_SECRET_KEY=<clerk_secret_key>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ARCJET_KEY=<arcjet_api_key>
GOOGLE_PLACE_API_KEY=<google_places_api_key>
NEXT_PUBLIC_MAPBOX_API_KEY=<mapbox_api_key>
``` 

---

## Running Locally  

1. `npm install`  
2. `npx convex dev`  
3. `npm run dev`  

Application runs at: http://localhost:3000 

---

## Contact  

Pritam Paul  
Email: pritampaul.10000@gmail.com  
GitHub: https://github.com/pritampaul00

