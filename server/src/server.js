import { app } from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, (error)=> {
    if (error) {
        throw error;
    }
    console.log(`${process.env.APP_NAME} | Express App - Visit: http://localhost:${PORT}`);
})