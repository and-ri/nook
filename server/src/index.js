import app from './app.js';
import { startScheduler } from './services/scheduler.js';

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    startScheduler();
});
