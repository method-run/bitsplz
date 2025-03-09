# Project TODO List

## Triaged

### In progress

- [ ] Add proper environment variable configuration #priority-0
- [ ] Add setup instructions in README #priority-0
- [ ] Milestone 0: Add to a public github repo #priority-0

### Prioritized

- [ ] Make sure this works in production build mode in docker #priority-1
- [ ] Add to a public github repo #priority-1
- [ ] Actually deploy to a cloud environment #priority-1
- [ ] Set up CI/CD pipeline #priority-1
- [ ] Implement proper error handling and recovery #priority-1
- [ ] Add comprehensive logging system #priority-1
- [ ] Implement rate limiting for websocket messages #priority-1
- [ ] Add input validation on both client and server #priority-1
- [ ] Milestone 1: Actually deploy to a cloud environment #priority-1

## Backlog

### Deployment & Infrastructure

- [ ] Set up CI/CD pipeline

### Performance & Optimization

- [ ] Optimize network traffic: Send block position deltas instead of full state
- [ ] Implement payload compression
- [ ] Fix double renders of user's active pixel during server lag
- [ ] Clean up inactive pixels after a generous amount of time
- [ ] Add request batching for high-frequency events

### Game Logic & Features

- [ ] Implement timestamp-ordered movement processing in DB
- [ ] Add infinite scrolling decision
- [ ] Implement collision detection between bits

### Code Quality & Architecture

- [ ] Clean up larger functions and components
- [ ] Add unit tests for critical game logic
- [ ] Set up TypeScript strict mode and fix any type issues
- [ ] Set up React 18 Strict Mode

### Documentation

- [ ] Add setup instructions in README #priority-0
- [ ] Document websocket message protocol
- [ ] Add architecture diagrams

### Security

- [ ] Set up proper CORS configuration
