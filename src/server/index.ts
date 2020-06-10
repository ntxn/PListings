import { app } from './app';
import './db/mongoose';

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API SERVER listening on port ${port}`));
