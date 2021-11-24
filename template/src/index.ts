import app, { port } from './server';

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.info(`Server listening on http://localhost:${port}`);
});
