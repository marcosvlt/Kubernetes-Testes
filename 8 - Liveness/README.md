# Table of Contents

1. [Introduction to Startup, Liveness, and Readiness Probes](#introduction-to-startup-liveness-and-readiness-probes)  
    1.1. [What Probes Are](#1-what-probes-are)  
    1.2. [Types of Probes](#2-types-of-probes)  
    1.3. [Key Probe Settings](#3-key-probe-settings)  
    1.4. [Probe Methods](#4-probe-methods)  
    1.5. [Common Patterns](#5-common-patterns)  
    1.6. [Example YAML](#6-example-yaml)  
    1.7. [Takeaway](#takeaway)  

2. [Hands-On: Startup Probes in Details](#hands-on-startup-probes-in-details)  
    2.1. [What the Exercise Shows](#what-the-exercise-shows)  
    2.2. [Base Pod Manifest](#base-pod-manifest)  
    2.3. [Simulating a Slow-Start Failure](#simulating-a-slow-start-failure)  
    2.4. [Why It Matters](#why-it-matters)  

3. [Hands-On: Liveness Probes in Details](#hands-on-liveness-probes-in-details)  
    3.1. [Workflow](#workflow)  
    3.2. [Quick Mental Model](#quick-mental-model)  

# Introduction to Startup, Liveness, and Readiness Probes

## 1\. What Probes Are

Kubernetes **probes** are automated health checks that the kubelet runs **inside each node**.  
You define them in the Pod spec—Kubernetes handles the scheduling and execution.

* * *

## 2\. Types of Probes

| Probe | Purpose | Typical Action on Failure |
| --- | --- | --- |
| **Startup** | Confirms the container has successfully started. Useful for apps with a long boot time. | Container is **restarted** if it never passes. |
| **Liveness** | Checks that the container is still “alive” (not deadlocked or hung). Runs periodically for the container’s entire lifetime. | Container is **restarted** when the failure threshold is reached. |
| **Readiness** | Checks whether the container is ready to receive traffic. | Pod is **removed from Service endpoints** until it passes again. (No restart unless combined with liveness.) |

> Startup probe gates the other two: Kubernetes won’t run liveness/readiness until startup succeeds.


&nbsp;

* * *



## 3\. Key Probe Settings

All probe types support similar fields:

- **`initialDelaySeconds`** – Wait before the first check.
    
- **`periodSeconds`** – How often to run the check.
    
- **`timeoutSeconds`** – How long to wait for a response.
    
- **`failureThreshold`** – How many consecutive failures before taking action.
    
- **`successThreshold`** – Consecutive successes needed to be considered “healthy” again.
    

* * *

## 4\. Probe Methods

You can choose one or more:

- **HTTP GET** – e.g. `/healthz` endpoint.
    
- **TCP Socket** – open a port to confirm it’s listening.
    
- **Exec Command** – run a command inside the container and check exit code.
    

* * *

## 5\. Common Patterns

- **Startup probe** for apps with heavy initialization (databases, JVM apps, migrations).
    
- **Liveness probe** to auto-recover from deadlocks or stuck threads.
    
- **Readiness probe** to avoid sending traffic before caches, DB connections, or warm-up tasks complete.
    

* * *

## 6\. Example YAML

```yaml
containers:
- name: myapp
  image: myimage:1.0
  startupProbe:
    httpGet:
      path: /healthz
      port: 8080
    failureThreshold: 30      # give it plenty of time to boot
    periodSeconds: 10
  livenessProbe:
    httpGet:
      path: /live
      port: 8080
    initialDelaySeconds: 30
    periodSeconds: 10
  readinessProbe:
    httpGet:
      path: /ready
      port: 8080
    initialDelaySeconds: 10
    periodSeconds: 5
```

* * *

### Takeaway

Use **startup** to handle slow boots, **liveness** to self-heal when the app hangs, and **readiness** to ensure only healthy pods get traffic. Correct probe tuning keeps your services stable and avoids sending users to pods that can’t serve them.

&nbsp;

# Hands-On: Startup Probes in Details

* * *

## What the Exercise Shows

You’re testing **startup probes** by:

1.  Deploying a pod that runs the **Color API v1.2.0** image (which has the configurable health endpoints).
    
2.  Adding a **startupProbe** in the Pod spec that hits `/health` every 3 s with `failureThreshold: 2`.
    
    - If the probe fails twice in a row (≈6 s total) Kubernetes restarts the container.

* * *

## Base Pod Manifest

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: color-api-pod
  labels:
    name: color-api-pod
spec:
  containers:
  - name: color-api-pod
    image: marcos1503/color-api:1.2.0
    resources:
      limits:
        memory: "128Mi"
        cpu: "500m"
      requests:
        memory: "64Mi"
        cpu: "250m"
    ports:
      - containerPort: 3000
    env:
      - name: DELAY_STARTUP
        value: "true"
    startupProbe:
      httpGet:
        path: /health
        port: 3000
      failureThreshold: 2
      periodSeconds: 3



```

*The probe succeeds by default and the Pod becomes `Running`.*

* * *

## Simulating a Slow-Start Failure

Add an environment variable to tell the app to block startup for 60 s:

```yaml
    env:
    - name: DELAY_STARTUP
      value: "true"
```

Redeploy:

```bash
kubectl delete pod color-api-pod
kubectl apply -f color-api-pod.yaml
kubectl get pod -w
```

You’ll see:

- **Restart Count** increase every ~6 s.
    
- Eventually `CrashLoopBackOff`.
    

Check details:

```bash
kubectl describe pod color-api-pod
  Normal   Killing    2s (x4 over 35s)   kubelet            Container color-api-pod failed startup probe, will be restarted
  
```

&nbsp;

### Why It Matters

- **Startup probes** are perfect for apps with long or unpredictable initialization.
    
- They prevent liveness/readiness probes from killing the container too soon and ensure Kubernetes keeps retrying until the app is really ready.

# Hands-On: Liveness Probes in Details

A **liveness probe** tells Kubernetes *when to restart a container* that has stopped behaving properly **after it has already started**.  
If the probe fails the specified number of times, kubelet kills the container and restarts it.

color-api-depl.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: color-api
spec:
  replicas: 6
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
        image: marcos1503/color-api:1.2.1
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
          requests:
            memory: "64Mi"
            cpu: "250m"
        ports:
          - containerPort: 3000
        env:
          - name: DELAY_STARTUP
            value: "false"
          - name: FAIL_LIVENESS
            value: "false"
          - name: FAIL_READINESS
            value: "true"
        startupProbe: # Startup probe (hits /up to confirm the app finished booting)
          httpGet:
            path: /up
            port: 3000
          failureThreshold: 2
          periodSeconds: 3
        livenessProbe: # Liveness probe (hits /health to confirm it stays healthy)
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 3
          periodSeconds: 10
          failureThreshold: 3
        readinessProbe: # Readiness probe (hits /ready to confirm the app is ready to serve traffic)
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 2
          periodSeconds: 5
  
```

color-api-svc.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: color-api-svc
spec:
  selector:
    app: color-api
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
  type: ClusterIP

```

## Workflow

1.  **Apply the manifest**
    
    ```bash
    kubectl apply -f readiness-probes
    kubectl get pod -w
    ```
    
    *Pod reaches `Running` because the startup probe (`/up`) passes.*
    
2.  **Observe Liveness Failures**  
    *After about 30 s* (3 failures × 10 s), `RESTARTS` count increases:
    
    ```bash
    kubectl describe pod color-api-pod
    # Events show: "Liveness probe failed"
    ```
    
3.  **Fix the Problem**
    
    - Set `FAIL_LIVENESS` back to `"false"` (or remove it).
        
    - `kubectl apply -f color-api-pod.yaml` again → container stops restarting.
        
4.  **Cleanup**
    
    ```bash
    kubectl delete pod color-api-pod
    ```
    

* * *

### Quick Mental Model

| Probe Type | Purpose | Typical Action on Failure |
| --- | --- | --- |
| **Startup** | Has the app finished initializing? | Restart container if it never starts. |
| **Liveness** | Is the app still healthy *after* starting? | Restart container. |
| **Readiness** | Is the app ready to serve traffic *right now*? | Remove pod from Service endpoints (no restart). |

&nbsp;