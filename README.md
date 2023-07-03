### To run the project locally, you need to:
1. Install dependencies by running `npm install`.
2. Set environment variables using:
```
export TRANSPORTER=nats://localhost:4222
export DATABASE_URL=postgresql://postgres:password@localhost:5432/ante-finance-interview
```

3. Install Docker and Docker-Compose, if you don't have it pre-installed already.
4. Run `docker compose up -d`.
5. Apply migrations by running `npx prisma migrate deploy`.
6. Run the app using `npm run dev`.
