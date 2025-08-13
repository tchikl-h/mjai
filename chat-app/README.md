# Angular 19 Chat Interface

A simple dark-mode chat interface between two users with auto-response functionality.

## Features

- Dark mode UI design
- Real-time message sending
- Auto-response with "hello" message
- Responsive design
- Timestamp display

## Setup

1. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

2. Start the development server:
   ```bash
   npm start
   # or
   bun run start
   ```

3. Open your browser to `http://localhost:4200`

## Usage

- Type a message in the input field
- Press Enter or click Send to send your message
- The other user will automatically respond with "hello" after 500ms
- Messages are displayed with timestamps in a chat bubble format

## Structure

- `src/app/app.component.ts` - Main component with chat logic
- `src/app/app.component.html` - Chat interface template
- `src/app/app.component.css` - Dark mode styling
- `src/styles.css` - Global dark theme styles