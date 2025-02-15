import express from 'express';
import cors from 'cors';
import { organizationsHandler } from './organizations';
import { loginHandler } from './login';
import { countryHandler } from './country';
import { registerHandler } from './register';

const app = express();
app.use(cors());

app.use(express.json());
app.route('/api/organizations')
   .post(organizationsHandler)
   .get(organizationsHandler); 

app.post('/api/login', loginHandler);
app.post('/api/register', registerHandler);
app.get('/api/country', countryHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
