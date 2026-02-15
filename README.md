# TODO Calendar 📅

A beautiful, interactive TODO list app with calendar view and hourly scheduling. Plan your days efficiently with a visual monthly calendar that shows task previews and detailed hourly schedules.

## Features

- 📅 **Monthly Calendar View**: See all days of the current month at a glance
- 📝 **Task Previews**: Each day shows a preview of your planned tasks
- ⏰ **Hourly Schedule**: Click any day to see a detailed 24-hour schedule
- 💾 **Auto-Save**: All tasks are automatically saved to browser localStorage
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- 🔄 **Month Navigation**: Easily navigate between months

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/belaltaher8/TODO-calendar.git
   cd TODO-calendar
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

   This will start a local server and open the app in your browser at `http://localhost:3000`

## Usage

### Viewing the Calendar
- The main view displays the current month with all days
- Days with tasks show a badge indicating the number of tasks
- The first task of each day appears as a preview

### Adding Tasks
1. Click on any day in the calendar
2. A modal will open showing 24 hourly time slots
3. Click on any hour's input field and type your task
4. Tasks are automatically saved when you finish typing

### Navigating Months
- Use the **←** and **→** buttons at the top to navigate between months
- The current month and year are displayed in the center

### Task Storage
- All tasks are saved automatically to your browser's localStorage
- Your tasks persist between sessions
- No server required - everything runs locally in your browser

## Deployment

To deploy this app to a web server:

1. **Simple HTTP Server**: Upload all files (`index.html`, `app.js`, `styles.css`, `package.json`) to your web server

2. **Using npm http-server**:
   ```bash
   npm install -g http-server
   http-server -p 8080
   ```

3. **Deploy to services like**:
   - GitHub Pages
   - Netlify
   - Vercel
   - Any static hosting service

## File Structure

```
TODO-calendar/
├── index.html       # Main HTML structure
├── app.js          # Application logic
├── styles.css      # Styling and layout
├── package.json    # NPM configuration
└── README.md       # Documentation
```

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

MIT
