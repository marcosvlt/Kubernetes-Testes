# Express API + Docker + Kubernetes

This repository contains a **minimal Express.js API** that is **Dockerized** and later deployed to **Kubernetes**.  
It demonstrates the full workflow: **build → push → run in Kubernetes Pods**.

---

## 📑 Index

1. [Building the Express Application and Dockerizing It](#building-the-express-application-and-dockerizing-it)  
   1. [Goal](#1-goal)  
   2. [Initialize the Node.js Project](#2-initialize-the-nodejs-project)  
   3. [Application Code](#3-application-code)  
   4. [Docker Setup](#4-docker-setup)  
   5. [Build & Run the Container](#5-build--run-the-container)  
   6. [Cleanup](#6-cleanup)  
   7. [Key Takeaways](#key-takeaways)  

2. [Building, Pushing, and Running Images in Kubernetes Pods](#building-pushing-and-running-images-in-kubernetes-pods)  
   1. [Application Overview](#1-application-overview)  
   2. [Building the Docker Image](#2-building-the-docker-image)  
   3. [Pushing to Docker Hub](#3-pushing-to-docker-hub)  
   4. [Running the Image in Kubernetes](#4-running-the-image-in-kubernetes)  
   5. [Testing Pod Connectivity](#5-testing-pod-connectivity)  
   6. [Cleanup](#6-cleanup-1)  
   7. [Key Takeaways](#key-takeaways-1)  

---

# Building the Express Application and Dockerizing It

## 1. Goal
- Create a simple **Express API** (`color-api`) to use and evolve throughout the Kubernetes course.  
- Build a **Docker image** for the app and test it locally.

---

## 2. Initialize the Node.js Project

```bash
npm init -y
npm install express@4.9.2 --save-exact
```

This generates:

* `package.json`
* `package-lock.json`
* `node_modules/`

---

## 3. Application Code

**`src/index.js`:**

```js
const express = require("express");
const app = express();
const port = 80;

app.get("/", (req, res) => {
  res.send("<h1 style='color:blue'>Hello from Color API</h1>");
});

app.listen(port, () => {
  console.log(`Color API listening on port ${port}`);
});

```

---

## 4. Docker Setup

**`.dockerignore`:**

```
node_modules
```

**`Dockerfile`:**

```dockerfile
FROM node:22-alpine3.20
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src src

CMD [ "npm", "start" ]
```

 `package.json` script:

```json
"scripts": {
  "start": "node src/index.js"
}
```

---

## 5. Build & Run the Container

**Build Image:**

```bash
docker build -t color-api .
docker images color-api
```

**Run Container:**

```bash
docker run -p 3000:80 --name color-api color-api
```

Then open: [http://localhost:3000](http://localhost:3000)

---

## 6. Cleanup

```bash
docker stop color-api
docker rm color-api
```

---

## Key Takeaways

* Minimal Express API created for Kubernetes experiments.
* Dockerized app using `node:22-alpine3.20`.
* `.dockerignore` excludes `node_modules`.
* Verified by running locally in Docker.

---

# Building, Pushing, and Running Images in Kubernetes Pods

## 1. Application Overview

* Node.js Express app with one `/` endpoint.
* Supporting files: `Dockerfile`, `.dockerignore`, `package.json`.
* Demonstrates: build → push → run in Kubernetes.

---

## 2. Building the Docker Image

`docker build -t dockerhub-username/color-api:1.0.0 .`

Tag format:

```
<dockerhub-username>/<repo-name>:<tag>
```

Verify image:

```bash
docker images | grep color-api
```

---

## 3. Pushing to Docker Hub

1. Login:

```bash
docker login
```

* Use a **Personal Access Token** for security.

2. Push the image:

```bash
docker push <docker-username>/color-api:1.0.0
```

3. Verify on Docker Hub (check repository tags).

---

## 4. Running the Image in Kubernetes

```bash
kubectl run color-api --image=<docker-username>/color-api:1.0.0
```

Check pod:

```bash
kubectl get pods
kubectl logs color-api
kubectl describe pod color-api
```

---

## 5. Testing Pod Connectivity

Launch an Alpine pod:

```bash
kubectl run alpine --image=alpine:3.20 -it sh
```

Install curl:

```bash
apk update && apk add curl
```

Test API:

```bash
curl <color-api-pod-IP>
```

---

## 6. Cleanup

```bash
kubectl delete pod alpine --force
kubectl delete pod color-api --force
kubectl get pods
```

---

## Key Takeaways

* End-to-end workflow: app → Docker → Docker Hub → Kubernetes.
* Use consistent image tags.
* Docker Hub tokens are safer than passwords.
* Pods use private IPs; test via an in-cluster pod.
* Cleanup keeps the cluster tidy.

