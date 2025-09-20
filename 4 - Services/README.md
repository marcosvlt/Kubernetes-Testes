# Index

- [Overview of Services](#overview-of-services)
    - [Why Services Exist](#why-services-exist)
    - [Service Types & When to Use Them](#service-types--when-to-use-them)
    - [Typical Workflow Example](#typical-workflow-example)
    - [Key Takeaways](#key-takeaways)
- [Hands-On: Color API - Implement v1.1.0: Add hostname information](#hands-on-color-api---implement-v110-add-hostname-information)
    - [Add Dependencies](#add-dependencies)
    - [Define a Color Variable](#define-a-color-variable)
    - [Update the Root Route (`/`)](#update-the-root-route-)
    - [New `/api` Route with Optional Format](#new-api-route-with-optional-format)
    - [Build & Run](#build--run)
    - [Test](#test)
    - [Push to Docker Hub (optional)](#push-to-docker-hub-optional)
- [Traffic Generator - Implement v1.0.0](#traffic-generator---implement-v100)
    - [`traffic-gen.sh`](#traffic-gensh)
    - [`Dockerfile`](#dockerfile)
    - [Build & Run](#build--run-1)
- [Deploy the Color API and Traffic Generator](#deploy-the-color-api-and-traffic-generator)
    - [Deployment: `color-api-deployment.yaml`](#deployment-color-api-deploymentyaml)
    - [One-off Traffic Generator Pod: `traffic-generator.yaml`](#one-off-traffic-generator-pod-traffic-generatoryaml)
    - [Demonstrate the Problem](#demonstrate-the-problem)
    - [Clean-up](#clean-up)
    - [Key Takeaways](#key-takeaways-1)
- [Working with ClusterIP Services](#working-with-clusterip-services)
    - [Usage Steps](#usage-steps)
    - [Key Takeaways](#key-takeaways-2)
- [Working with NodePort Services](#working-with-nodeport-services)
    - [Quick Cluster Check](#1-quick-cluster-check)
    - [From ClusterIP ➜ NodePort](#2-from-clusterip--nodeport)
    - [YAML Changes](#3-yaml-changes)
    - [Accessing the Service](#4-accessing-the-service)
    - [Security & Best Practice](#5-security--best-practice)
- [Hands-On: Working with ExternalName Services](#hands-on-working-with-externalname-services)
    - [Create the ExternalName Service](#create-the-externalname-service)
    - [Exec Into the Pod and Curl](#exec-into-the-pod-and-curl)
    - [Notes & Tips](#notes--tips)

# Overview of Services

## Why Services Exist

- **Pods are ephemeral**: their IPs change whenever a pod is rescheduled.
    
- **Without Services**: Clients would have to track pod IPs directly—fragile and error-prone.
    
- **With Services**:
    
    - Provide a **stable virtual IP (ClusterIP)** and an **internal DNS name**.
        
    - Automatically **load-balance traffic** across healthy pods that match a label selector.
        

**Key sections in a Service manifest**:

- **metadata.name** → becomes the internal DNS name (e.g. `my-service.default.svc.cluster.local`).
    
- **spec.selector** → label match for target pods.
    
- **spec.ports** → maps client-facing port(s) to the container’s target port(s).
    
- **spec.type** → defines how the service is exposed.
    

* * *

## Service Types & When to Use Them

| Type | Exposure | Typical Use Case |
| --- | --- | --- |
| **ClusterIP (default)** | Internal-only stable IP inside the cluster. | Internal microservice-to-microservice communication (e.g. `frontend → backend`). Often paired with **Ingress** to expose HTTP/HTTPS externally. |
| **NodePort** | Opens the same port on **every node’s IP** (range `30000–32767`). Accessed via `<NodeIP>:<NodePort>`. | Quick external access for **development or testing** when you don’t want/need a cloud load balancer. |
| **LoadBalancer** | Provisions a **cloud provider’s load balancer** and assigns a public IP. | **Production external access** in managed clusters (AWS, GCP, Azure, etc.). Simplifies scaling & high availability. |
| **ExternalName** | No proxying; returns a **CNAME record** pointing to an external DNS name. | Allow in-cluster pods to reach **external services** via a consistent internal name (`mydb.default.svc` → `db.example.com`). |

* * *

### Typical Workflow Example

1.  **Backend Service**:
    
    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: api-nodeport
    spec:
      type: NodePort
      selector:
        app: api-backend
      ports:
        - protocol: TCP
          port: 80
          targetPort: 80
          nodePort: 30007 
          
    ```
    
    - Pods with label `app=api-backend` get traffic on port 8080.
        
    - Other pods can hit `http://api-backend` (DNS) or the assigned ClusterIP.
        
2.  **Expose for Dev/Testing**:
    
    ```bash
    kubectl expose deployment backend --type=NodePort --port=80
    ```
    
3.  **Production Cloud**: switch to:
    
    ```yaml
    type: LoadBalancer
    ```
    
    to get a managed external IP.
    

* * *

### Key Takeaways

- **ClusterIP is default and most common** for internal service-to-service communication.
    
- **NodePort is simple but rarely used in production** because it exposes nodes directly and lacks smart load balancing.
    
- **LoadBalancer is the go-to for production external traffic** in cloud environments.
    
- **ExternalName provides a stable in-cluster alias for an outside resource**, avoiding hardcoded URLs.
    

This layered approach—Pods → Services → (Ingress/LoadBalancer)—is what gives Kubernetes reliable, dynamic networking while keeping clients oblivious to pod churn.

# Hands-On: Color API - Implement v1.1.0: Add hostname information

* * *

### Add Dependencies

Use Node’s built-in `os` module—no `npm install` required:

```js
const os = require("os");
```

### Define a Color Variable

```js
const color = "blue";
```

### Update the Root Route (`/`)

Return HTML with both color and hostname:

```js
app.get("/", (req, res) => {
  res.send(`<h2>Color: ${color}<br>Hostname: ${os.hostname()}</h2>`);
});
```

###  New `/api` Route with Optional Format

```js
app.get("/api", (req, res) => {
  const { format } = req.query;

  if (format === "json") {
    return res.json({
      color,
      hostname: os.hostname(),
    });
  }

  // default: plain text
  res.send(`color: ${color}, hostname: ${os.hostname()}`);
});
```

### Build & Run

```bash
docker build -t <username>/color-api:1.1.0 .
docker run -d -p 8080:80 <username>/color-api:1.1.0
```

###  Test

- HTML: `curl http://localhost:8080`
    
- Plain text: `curl http://localhost:8080/api`
    
- JSON: `curl "http://localhost:8080/api?format=json"`
    

You should see the hostname match the first part of the container ID (`docker ps`).

### Push to Docker Hub (optional)

```bash
docker push <username>/color-api:1.1.0
```

* * *

This small enhancement makes the demo more useful for Kubernetes/Docker demonstrations, since you can instantly verify which container or pod handled a request and choose the output format for scripts or dashboards.


# Traffic Generator - Implement v1.0.0

### `traffic-gen.sh`

```sh
#!/bin/sh
# Simple traffic generator: sends repeated curl requests to a target at a given interval

# --- Validation ---
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <target> <interval_in_seconds>"
  exit 1
fi

target="$1"
interval="$2"

echo "Sending requests to $target every $interval seconds"

# --- Infinite loop ---
while true; do
  request_time=$(date "+%Y-%m-%d %H:%M:%S")
  response=$(curl -s "$target")
  echo "[$request_time] $response"
  sleep "$interval"
done
```

Make it executable:

```bash
chmod +x traffic-gen.sh
```

* * *

### `Dockerfile`

```dockerfile
# Lightweight Alpine image with curl
FROM alpine:3.20
WORKDIR /app

# Install curl
RUN apk add --no-cache curl

# Copy script and make it executable
COPY traffic-gen.sh /app/traffic-gen.sh
RUN chmod +x /app/traffic-gen.sh

# Entry point so arguments get passed through
ENTRYPOINT ["/app/traffic-gen.sh"]
```

* * *

### Build & Run

Build the image (replace `YOUR_DOCKER_USER` with your Docker Hub username if you plan to push it):

```bash
docker build -t YOUR_DOCKER_USER/traffic-generator:1.0.0 .
```

Run it, e.g. hitting Google every half-second:

```bash
docker run --rm YOUR_DOCKER_USER/traffic-generator:1.0.0 https://www.google.com 0.5
```

To hit a local API (on host port 8080), you can give the container access to the host network:

```bash
docker run --rm --network=host YOUR_DOCKER_USER/traffic-generator:1.0.0 http://localhost:8080/api 0.5
```

* * *

This matches the lecture’s final working setup:

- A portable shell script with minimal dependencies.
    
- A small Alpine-based image.
    
- Parameters (target & interval) passed directly to the container.

# Deploy the Color API and Traffic Generator

## Deployment: `color-api-deployment.yaml`

Creates a Deployment with 5 replicas of the Color API container.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: color-api
  labels:
    app: color-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: color-api
  template:
    metadata:
      labels:
        app: color-api
    spec:
      containers:
        - name: color-api
          image: marcos1503/color-api:1.0.0
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: "64Mi"
              cpu: "250m"
            limits:
              memory: "128Mi"
              cpu: "500m"

```

Apply it:

```bash
kubectl apply -f color-api-deployment.yaml
kubectl get pods          # verify 5 pods are running
kubectl get replicaset    # confirm ReplicaSet creation
```

##  One-off Traffic Generator Pod: `traffic-generator.yaml`

This pod continuously curls a **single pod’s private IP** every 0.5 s.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: traffic-generator
  labels:
    app: traffic-generator
spec:
  containers:
    - name: traffic-generator
      image: lmacademy/traffic-generator:1.0.0   # or <your_dockerhub_user>/traffic-generator:1.0.0
      args:
        - "http://<POD_PRIVATE_IP>:80/api"      # replace with the actual Pod IP you found via `kubectl describe pod`
        - "0.5"
```

Steps:

```bash
# Find a target pod IP
kubectl get pods -l app=color-api -o wide

# Edit traffic-generator.yaml to use that IP, then:
kubectl apply -f traffic-generator.yaml

# View logs in real time
kubectl logs -f traffic-generator
```

You’ll see repeating `[timestamp]` log lines from the traffic generator.

* * *

##  Demonstrate the Problem

Delete the targeted Color API pod:

```bash
kubectl delete pod <color-api-pod-name>
```

*The generator stops receiving responses* because the private IP disappeared and the replacement pod has a new IP.

* * *

## Clean-up

```bash
kubectl delete pod traffic-generator
# Optionally remove the deployment too:
# kubectl delete deployment color-api-deployment
```

* * *

### Key Takeaways

- **Pod IPs are ephemeral.** When a pod dies or is replaced, its IP changes.
    
- **Direct IP binding is fragile.** Anything hard-coded to a pod’s IP breaks on pod recreation.
    
- **Next step: Services.** A ClusterIP Service will give a stable virtual IP/DNS name (e.g., `color-api.default.svc.cluster.local`) so clients like our traffic generator can survive pod restarts.

# Working with ClusterIP Services

  
Save it as **`color-api-clusterip.yaml`** (or similar) inside your `services` folder.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: color-api-cluster-ip
  labels:
    app: color-api
spec:
  type: ClusterIP
  selector:
    app: color-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      name: http
    - protocol: TCP
      port: 3000
      targetPort: 3000
      name: api
  
  
```

### Usage Steps

1.  **Apply the Deployment** (if not already running):
    
    ```bash
    kubectl apply -f color-api-deployment.yaml
    ```
    
2.  **Create the Service**:
    
    ```bash
    kubectl apply -f color-api-clusterip.yaml
    ```
    
3.  **Verify**:
    
    ```bash
    kubectl get svc
    ```
    
    You’ll see a `CLUSTER-IP` that works only inside the cluster.
    
4.  **DNS-Based Access**  
    Instead of using the numeric ClusterIP, reference the service by **name**:
    
    ```
    http://color-api-clusterip
    ```
    
    Kubernetes’ built-in DNS (CoreDNS) automatically resolves this name to the current internal IP.
    

### Key Takeaways

- **ClusterIP is internal-only**: traffic is available only to pods within the same cluster.
    
- **Name is more stable than IP**: deleting/recreating the Service will change the ClusterIP, but the DNS name remains consistent.
    
- Any workload (traffic generator, other services, etc.) should use the service name to communicate with the `color-api` pods.
    

&nbsp;

# Working with NodePort Services

* * *

### 1\. Quick Cluster Check

- **kubectl get pods / svc / deploy / rs** – verified that pods, services, deployments, and replica sets are all running as expected before adding anything new.

* * *

### 2\. From ClusterIP ➜ NodePort

- **ClusterIP** is the default Kubernetes Service type:
    
    - Provides a stable internal IP/DNS name.
        
    - Used **only for internal traffic** within the cluster.
        
- **NodePort** extends ClusterIP:
    
    - Still gives you the internal ClusterIP, **plus**
        
    - Exposes a fixed port (range 30000–32767) on **every node’s IP** so external clients can reach the pods.
        

* * *

### 3\. YAML Changes

You duplicated the existing `color-api-clusterip.yaml` and edited:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: color-api-node-port
  labels:
    app: color-api
spec:
  type: NodePort
  selector:
    app: color-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
      nodePort: 30080
      name: http
    - protocol: TCP
      port: 3000
      targetPort: 3000
      nodePort: 30081
      name: api 
  
  
```

*Only the `type` and `nodePort` are new.*

* * *

### 4\. Accessing the Service

- **On Linux** (bare-metal or native cluster):
    
- &nbsp;
    
    - Find the INTERNAL-IP from minikube
        - kubectl get nodes -o wide
    - You can hit `http://<node-internal-ip>:30007`.
- **On macOS/Windows with Minikube:**
    
    - The node’s internal IP isn’t directly reachable.
        
    - Use:
        
        ```bash
        minikube service color-api-nodeport --url
        ```
        
    - This command runs a lightweight tunnel and prints a local URL (often something like `http://127.0.0.1:XXXXX`) that forwards traffic to `nodePort 30007`.
        

* * *

### 5\. Security & Best Practice

- NodePort exposes your pods to the outside world—less secure than ClusterIP.
    
- Usually reserved for **development** or **simple demos**.
    
- In production, you’d typically front services with an **Ingress** or a cloud provider’s **LoadBalancer**.
    

* * *

&nbsp;

# Hands-On: Working with ExternalName Services

### Create the ExternalName Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-external-svc
spec:
  type: ExternalName
  externalName: google.com
  
```

Apply it:

```bash
kubectl apply -f google-externalname.yaml
```

Check:

```bash
kubectl get svc
```

You should see `my-external-svc` with `TYPE` = `ExternalName` and `CLUSTER-IP` = `<none>`.

* * *

### Exec Into the Pod and Curl

```bash
kubectl exec -it traffic-generator sh
curl my-external-svc
```

- Kubernetes resolves `my-external-svc` → CNAME `google.com`.
    
- Curl reaches Google and likely returns an HTML response with a `404` (expected since no explicit `https`).
    

* * *

&nbsp;

**Notes & Tips**

- **ExternalName** services are essentially internal DNS CNAME records.
    
- They don’t create ClusterIPs or proxies; DNS resolution is handled by CoreDNS.
    
- Useful when you want an internal, stable name pointing to an **external DNS host**.
    

This captures the whole flow you demonstrated: create → test → confirm → cleanup.