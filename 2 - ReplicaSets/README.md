

# Table of Contents

1. [ReplicaSets in Kubernetes](#replicasets-in-kubernetes)
    - [Problem with Standalone Pods](#1-problem-with-standalone-pods)
    - [What is a ReplicaSet?](#2-what-is-a-replicaset)
    - [Key Features](#3-key-features)
    - [YAML Example](#4-yaml-example)
    - [How it Works](#5-how-it-works)
    - [Example Scenario](#6-example-scenario)
    - [Important Notes](#7-important-notes)
2. [Hands-On: Working with ReplicaSets in Kubernetes](#hands-on-working-with-replicasets-in-kubernetes)
    - [Create a ReplicaSet Definition](#1-create-a-replicaset-definition)
    - [Apply the ReplicaSet](#2-apply-the-replicaset)
    - [Verify Pods Created](#3-verify-pods-created)
    - [Test Self-Healing](#4-test-self-healing)
    - [Inspect the ReplicaSet](#5-inspect-the-replicaset)
    - [Important Notes](#6-important-notes)


# ReplicaSets in Kubernetes

## 1\. Problem with Standalone Pods

- Pods created manually are **not self-healing**.
    
- If a Pod is **deleted** or becomes **unhealthy**, manual intervention is required.
    
- This makes them unsuitable for **high availability** or **fault-tolerant** applications.
    

* * *

## 2\. What is a ReplicaSet?

- A **Kubernetes controller** that ensures a stable number of **identical Pods** are always running.
    
- Continuously monitors Pods and replaces failed or deleted ones.
    
- Provides the foundation for **high availability**.
    

* * *

## 3\. Key Features

- **Replicas**: Defines how many Pods should run.
    
- **Selector**: Identifies which Pods belong to the ReplicaSet (using `matchLabels`).
    
- **Template**: Pod specification used to create new Pods if any are missing.
    

* * *

## 4\. YAML Example

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-replicaset
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx   # must match selector
    spec:
      containers:
        - name: nginx
          image: nginx:1.27.0
          ports:
            - containerPort: 80
```

* * *

## 5\. How it Works

1.  **Desired State**: ReplicaSet checks if the number of Pods = `replicas`.
    
2.  **Continuous Monitoring**:
    
    - If a Pod fails or is deleted, ReplicaSet notices the mismatch.
        
    - Creates a new Pod based on the **template**.
        
3.  **Label Matching**:
    
    - Only Pods matching the `selector` are managed.
        
    - Labels in Pod template **must match** selector for correct tracking.
        

* * *

## 6\. Example Scenario

- Desired replicas: **3**
    
- Running pods: **3**  
    ✅ All good.
    
- One pod deleted: **2** remain.  
    ⚠️ ReplicaSet detects mismatch → creates a **new pod** to restore count to 3.
    

* * *

## 7\. Important Notes

- ReplicaSets are the **mechanism behind Deployments**.
    
- Rarely created manually, but crucial to understand.
    
- Deployments (next topic) build on ReplicaSets to provide:
    
    - Rolling updates
        
    - Rollbacks
        
    - Versioned history
        

* * *

✅ **Key Takeaway**: ReplicaSets guarantee that the **desired number of Pods** is always running, automatically handling failures or deletions, making them the building block for **scalable and resilient applications**.

# Hands-On: Working with ReplicaSets in Kubernetes

## 1\. Create a ReplicaSet Definition

Inside the `replica-sets/` folder, create a file named:

`nginx-replicaset.yaml`

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-rs
  labels:
    app: nginx
  annotations:
    description: "This is an nginx replicaset for learning"
    version: "1.0"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
      annotations:
        description: "This is an nginx pod template for learning"
        version: "1.0"
    spec:
      containers:
      - name: nginx
        image: nginx:1.27.0
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

* * *

## 2\. Apply the ReplicaSet

```bash
kubectl apply -f nginx-replicaset.yaml
```

Check that it was created:

```bash
kubectl get rs
```

Expected output:

- **Desired = 3**
    
- **Current = 3**
    
- **Ready = 3**
    

* * *

## 3\. Verify Pods Created

```bash
kubectl get pods
```

You should see 3 Pods with names like:

```
nginx-replicaset-xxxxx
nginx-replicaset-yyyyy
nginx-replicaset-zzzzz
```

Pods are named after the **ReplicaSet name + random suffix**.

* * *

## 4\. Test Self-Healing

Delete one Pod:

```bash
kubectl delete pod nginx-replicaset-xxxxx
```

Check Pods again:

```bash
kubectl get pods
```

Expected:

- The deleted Pod disappears.
    
- A **new Pod** is automatically created by the ReplicaSet to maintain 3 replicas.
    

* * *

## 5\. Inspect the ReplicaSet

```bash
kubectl describe rs nginx-replicaset
```

Key sections:

- **Replicas** (desired, current, ready)
    
- **Pod Template** (labels, containers, image, ports)
    
- **Events** (shows initial Pod creation + new Pod creation after deletion)
    

* * *

## 6\. Important Notes

- Labels inside the **Pod template** are required and must match the `selector`.
    
- ReplicaSet itself doesn’t need labels in its metadata.
    
- The **ReplicaSet controller** continuously monitors and ensures desired replicas are running.
    
- Pods created are **replaceable**, so they should be treated as **ephemeral resources**.

* * *

### 1\. **ReplicaSet enforces the desired count**

- When you created the extra `sole-nginx` pod **with the same labels**, the ReplicaSet detected **4 running pods instead of 3**.
    
- Its job is to **maintain exactly 3**, so it terminated the extra pod.
    
- This shows that the ReplicaSet actively reconciles actual vs. desired state.
    

* * *

### 2\. **Any pod with matching labels is managed by the ReplicaSet**

- Even if you didn’t create the pod using the ReplicaSet’s template, as long as the **labels match**, the ReplicaSet counts it.
    
- That’s why when you first created a standalone pod (`sole-nginx`) and then applied the ReplicaSet, it only created **2 additional pods** (to reach the total of 3).
    

* * *

### 3\. **Downside of mixing standalone pods and ReplicaSets**

- Having a “manual pod” (`soul-nginx`) alongside a ReplicaSet that uses the same labels means you’re maintaining **two sources of truth**:
    
    - the pod definition
        
    - the ReplicaSet template
        
- This makes your configuration messy and harder to manage.
    
- That’s why the recommended practice is to **delete the standalone pod** and rely solely on the ReplicaSet to manage replicas.
    

* * *

### 4\. **ReplicaSet’s reconciliation loop**

- Desired state = defined in ReplicaSet spec.
    
- Actual state = observed in the cluster.
    
- If actual > desired → it deletes.
    
- If actual < desired → it creates new pods from its template.
    
- This loop runs continuously to ensure stability.
    

* * *

👉 In short: **let the ReplicaSet own all pods that share its selector.** If you need to test pods individually, use different labels so they don’t get absorbed by an existing ReplicaSet.

&nbsp;