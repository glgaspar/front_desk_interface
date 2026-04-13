# Front Desk Interface

Front Desk Interface is the web frontend for the **Front Desk** system—a powerful, self-hosted homelab and cloud environment management dashboard. Built with Next.js, it connects seamlessly to the Front Desk Go backend to provide an intuitive UI for Docker container orchestration, real-time log streaming, and service integration management.

## Features

* **App & Container Management**: Visual interface to create, start, stop, and remove Docker containers. Dynamically edit configurations (e.g., `docker-compose.yml`) directly from the browser.
* **Real-Time Streaming**: Watch live Docker build and execution logs rendered in the browser via Server-Sent Events (SSE) backed by Kafka.
* **System Dashboard**: View host system CPU, memory, and top process usage. Customize your experience with toggleable widgets.
* **Service Integrations**:
  * **Cloudflare**: Manage Zero Trust tunnels and DNS routing.
  * **Pi-hole**: View DNS query history and configurations.
  * **Transmission**: Manage active torrents and update configurations.
* **Secure Access**: Login interface backed by secure cookie-based session management.

## Getting Started

### Prerequisites

* Node.js 18+ (or compatible version)
* A running instance of the Front Desk API backend

### Installation & Setup

1. Install the dependencies:

```bash
npm install
# or yarn / pnpm / bun install
```

2. Set up your environment variables by creating a `.env.local` file (ensure you point it to your running Front Desk API):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080 # Example API URL
```

3. Run the development server:

```bash
npm run dev
# or yarn dev / pnpm dev / bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying with Docker

This application is configured for easy deployment using Docker.

### Prerequisites

*   Docker
*   Docker Compose

### Local Deployment

1.  **Configure Environment**: Before building, ensure you have a `.env.local` file in the project root. This file provides the build-time configuration for the Next.js application to connect to your backend API.

    ```env
    # .env.local
    NEXT_PUBLIC_API_URL=http://<your-backend-api-ip>:8080
    ```
    Replace `<your-backend-api-ip>` with the IP address or hostname of your Front Desk API. Note that `localhost` will not work if the backend runs on the host and the frontend is inside a Docker container, unless you use host networking.

2.  **Build and Run**: Use Docker Compose to build and run the application in production mode. The `docker-compose.yml` file will handle building the image and running the container.

    ```bash
    docker compose up --build -d
    ```

3.  **Access the Application**: Once the container is running, you can access the Front Desk Interface by navigating to `http://localhost:3000` in your browser.
