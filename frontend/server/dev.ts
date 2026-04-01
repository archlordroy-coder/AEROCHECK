import "dotenv/config";
import { createServer } from "./index";

const app = createServer();
const port = Number(process.env.API_PORT || 3000);

app.listen(port, () => {
  console.log(`AEROCHECK backend running on http://localhost:${port}`);
});
