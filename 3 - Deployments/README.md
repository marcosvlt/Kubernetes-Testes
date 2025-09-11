# Table of Contents

- [Introduction to Deployments](#introduction-to-deployments)
    - [1. Pods (lowest-level abstraction)](#1-pods-lowest-level-abstraction)
    - [2. ReplicaSets](#2-replicasets)
    - [3. Deployments (higher-level abstraction)](#3-deployments-higher-level-abstraction)
- [Deployment Mechanics](#deployment-mechanics)
- [Example: Nginx Deployment](#example-nginx-deployment)
- [Hands-On: Creating and Managing Deployments](#hands-on-creating-and-managing-deployments)
    - [1. Deployment Definition File](#1-deployment-definition-file)
    - [2. Applying the Deployment](#2-applying-the-deployment)
    - [3. Checking the Deployment](#3-checking-the-deployment)
    - [4. ReplicaSet Behind the Scenes](#4-replicaset-behind-the-scenes)
    - [5. Pods and Template Hash](#5-pods-and-template-hash)
- [Why the Pod-Template-Hash Matters](#why-the-pod-template-hash-matters)
- [Commands You’ll Commonly Use with Deployments](#commands-youll-commonly-use-with-deployments)
- [Hands-On: Updating the Pod Template](#hands-on-updating-the-pod-template)
    - [1. The Deployment update process](#1-the-deployment-update-process)
    - [2. Behavior of ReplicaSets during an update](#2-behavior-of-replicasets-during-an-update)
    - [3. Pod-template-hash label](#3-pod-template-hash-label)
    - [4. How to verify the update](#4-how-to-verify-the-update)
- [Hands-On: Understanding Rollouts](#hands-on-understanding-rollouts)
    - [1. `kubectl rollout` subcommands](#1-kubectl-rollout-subcommands)
    - [2. Rollout history and revisions](#2-rollout-history-and-revisions)
    - [3. Inspecting revisions](#3-inspecting-revisions)
    - [4. Adding a change cause](#4-adding-a-change-cause)
    - [5. Why this matters in real projects](#5-why-this-matters-in-real-projects)
    - [6. Suggested sandbox experiments](#6-suggested-sandbox-experiments)
- [Hands-On: Scaling Deployments with Kubectl](#hands-on-scaling-deployments-with-kubectl)
    - [1. Imperative Scaling](#1-imperative-scaling)
    - [2. Temporary Nature](#2-temporary-nature)
    - [3. Recommended Practice](#3-recommended-practice)
    - [4. Legit Use Case for `scale`](#4-legit-use-case-for-scale)
    - [5. Rollout History](#5-rollout-history)
- [Troubleshooting Failed Rollouts](#troubleshooting-failed-rollouts)
    - [1. Triggering a Failed Rollout](#1-triggering-a-failed-rollout)
    - [2. Observing the Symptoms](#2-observing-the-symptoms)
    - [3. Digging Into Pods](#3-digging-into-pods)
    - [4. Deployment’s Built-in Safety](#4-deployments-built-in-safety)
    - [5. Emergency Options](#5-emergency-options)
    - [6. Permanent Fix](#6-permanent-fix)
    - [7. Rollout History & Generations](#7-rollout-history--generations)
    - [8. Cleanup](#8-cleanup)
    - [Key Lessons](#key-lessons)

# Introduction to Deployments

### 1\. **Pods (lowest-level abstraction)**

- Smallest deployable unit.
    
- Good for quick tests or single-container apps.
    
- Limitation: fragile — if the pod dies, nothing ensures a new one replaces it.
    

* * *

### 2\. **ReplicaSets**

- Solve fragility by ensuring **N pods are always running**.
    
- If a pod crashes → ReplicaSet recreates it.
    
- If too many pods appear → ReplicaSet removes extras.
    
- Limitation: only maintains *quantity* of pods.
    
    - No version history.
        
    - No controlled updates.
        
    - No rollback if a bad version is deployed.
        

* * *

### 3\. **Deployments (higher-level abstraction)**

- Manage ReplicaSets for you.
    
- Add critical features for **production-grade apps**:
    
    - **Rolling updates** → no downtime, gradual replacement.
        
    - **Rollbacks** → revert to previous version if issues occur.
        
    - **Revision history** → Keep track of the history of all chanfes made, allowing you to reverte
        
    - **Declarative updates** os replicas overtime
        
    - **Advanced rollouts →**  Limit risk by leveraging controlled rollouts of new versions, ensuring that updates are applied and safely
        

* * *

## Deployment Mechanics

1.  **You create a Deployment.**
    
    - It automatically creates a ReplicaSet.
        
    - That ReplicaSet manages the pods.
        
2.  **You update the Deployment (e.g., change image version).**
    
    - Deployment creates a **new ReplicaSet** with the new template.
        
    - It performs a **rolling update**:
        
        - Spin up a pod from the new ReplicaSet.
            
        - Once healthy → terminate one pod from the old ReplicaSet.
            
        - Repeat until all pods are updated.
            
3.  **Deployment cleans up.**
    
    - Once migration is complete, the old ReplicaSet (empty of pods) can be removed.
        
    - History is stored so you can roll back.
        

* * *

## Example: Nginx Deployment

Here’s a minimal Deployment YAML based on your lecture:

```yaml
apiVersion: v1
kind: Deployment
metadata:
  name: nginx-deploy
  labels:
    app: nginx
  annotations:
    description: "This is an nginx deployment for learning"
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
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1 
```

* * *

✅ With this file:

- **Initial creation** → one ReplicaSet with 3 pods.
    
- **Update image (e.g., `nginx:1.28.0`)** → new ReplicaSet created, rolling update replaces pods one by one.
    
- **Rollback** → `kubectl rollout undo deployment nginx-deployment`.
    

* * *

# Hands-On: Creating and Managing Deployments

1.  **Deployment Definition File**
    
    - Create `nginx-deploy.yaml` with:
        
        - `apiVersion: apps/v1`
            
        - `kind: Deployment`
            
        - `metadata` → name + labels (applied to the Deployment object itself, *not* to pods)
            
        - `spec` → replicas, selector, template (with labels + pod spec)
            
    - The **strategy** was left to default → `RollingUpdate`.
        

* * *

2.  **Applying the Deployment**
    
    ```bash
    kubectl apply -f nginx-deployment.yaml
    ```
    
    - Kubernetes created a **Deployment object**.
        
    - The Deployment automatically created a **ReplicaSet** (you didn’t have to define it).
        
    - The ReplicaSet created and managed **Pods**.
        
    
    👉 The chain is: **Deployment → ReplicaSet → Pods**.
    

* * *

3.  **Checking the Deployment**
    
    ```bash
    kubectl get deploy
    kubectl describe deployment nginx-deployment
    ```
    
    - Confirmed 5 pods are **ready**, **up-to-date**, and **available**.
        
    - Strategy shown as `RollingUpdate`.
        
    - Events showed: Deployment scaling the ReplicaSet up to 5 pods.
        

* * *

4.  **ReplicaSet Behind the Scenes**
    
    ```bash
    kubectl get rs
    ```
    
    - A ReplicaSet exists with a hash suffix in its name.
        
    - That hash represents the **pod template spec** (Deployment hashes its contents).
        

* * *

5.  **Pods and Template Hash**
    
    ```bash
    kubectl get pod <pod-name> -o yaml
    ```
    
    - Pods have:
        
        - `app=nginx` label (from your template).
            
        - `pod-template-hash=<HASH>` label (auto-generated by Deployment).
            
    - This `pod-template-hash` is how Kubernetes links Pods → ReplicaSet → Deployment.
        
    
    👉 If you update the Deployment (e.g., change `image: nginx:1.27.0` → `1.28.0`):
    
    - The **hash changes**.
        
    - A **new ReplicaSet** is created.
        
    - Old ReplicaSet gradually scales down as the new one scales up.
        

* * *

## Why the Pod-Template-Hash Matters

- Each **ReplicaSet is tied to a specific pod template** (immutable).
    
- Deployment creates a **new ReplicaSet for every new template version**.
    
- The hash allows Kubernetes to:
    
    - Distinguish old vs. new versions of Pods.
        
    - Safely manage rolling updates.
        
    - Track revision history for rollbacks.
        

* * *

## Commands You’ll Commonly Use with Deployments

- **View Deployments**
    
    ```bash
    kubectl get deployments
    ```
    
- **View ReplicaSets created by a Deployment**
    
    ```bash
    kubectl get rs
    ```
    
- **View Pods managed by a Deployment**
    
    ```bash
    kubectl get pods
    ```
    
- **Update Deployment (example: new image)**
    
    ```bash
    kubectl set image deployment/nginx-deployment nginx=nginx:1.28.0
    ```
    
- **Check rollout status**
    
    ```bash
    kubectl rollout status deployment/nginx-deployment
    ```
    
- **Rollback to previous version**
    
    ```bash
    kubectl rollout undo deployment/nginx-deployment
    ```
    

* * *

✅ So now you’ve seen:

- How Deployments wrap ReplicaSets.
    
- How pod-template-hash ensures consistent version tracking.
    
- How Kubernetes manages updates automatically behind the scenes.
    

* * *

&nbsp;

# Hands-On: Updating the Pod Template

### 1\. The Deployment update process

- You updated the pod template (image → `nginx:1.27.0-alpine`).
    
- `kubectl diff` showed:
    
    - `generation` increased → signals a new revision of the Deployment.
        
    - container `image` field updated.
        
- When applying, the Deployment created a new ReplicaSet with a new `pod-template-hash` label.
    
- It then gradually:
    
    - scaled up the new ReplicaSet,
        
    - scaled down the old ReplicaSet,
        
    - ensuring that availability was maintained.
        
- This is the rolling update strategy in action.
    

* * *

### 2\. Behavior of ReplicaSets during an update

- Old ReplicaSet stays alive but is scaled down step by step.
    
- New ReplicaSet is created and scaled up in parallel.
    
- This is different from `Recreate` strategy, where all old pods are killed first, then new ones are started.
    

* * *

### 3\. Pod-template-hash label

- Every ReplicaSet has a unique `pod-template-hash` generated from the Deployment’s pod template.
    
- That’s how Kubernetes knows which ReplicaSet belongs to which version of the Deployment.
    
- When you change the template (like the image), a new hash is created → new ReplicaSet.
    

* * *

### 4\. How to verify the update

- `kubectl get deploy` → shows rollout status.
    
- `kubectl describe deploy nginx-deployment` → shows events (scaled up new RS, scaled down old RS).
    
- `kubectl get rs` → you see old and new ReplicaSets, with different replica counts.
    
- `kubectl get pods` → shows pods terminating and new ones starting.
    
- `kubectl describe pod <pod-name>` → confirms container image has been updated.
    

* * *

The takeaway: Deployments manage updates safely by creating and scaling ReplicaSets under the hood. That’s why in real-world production, we almost never use ReplicaSets directly — Deployments give us versioning, history, and rollout control.

# Hands-On: Understanding Rollouts  

### 1\. `kubectl rollout` subcommands

- `history` → view past rollout revisions.
    
- `pause` / `resume` → control automated rollouts.
    
- `restart` → restart pods managed by the Deployment.
    
- `status` → check current rollout progress.
    
- `undo` → roll back to the previous version.
    

These commands let you safely track, pause, and revert Deployment changes.

* * *

### 2\. Rollout history and revisions

- Every time you change the Deployment’s **pod template**, Kubernetes creates a **new revision**.
    
- `kubectl rollout history deployment/nginx-deployment` shows the list.
    
- At first, you had:
    
    - Revision 1 → `nginx:1.27.0`
        
    - Revision 2 → `nginx:1.27.0-alpine`
        
- After undoing, Kubernetes created **Revision 3**, which is just a copy of Revision 1.
    
    - That’s why Revision 1 “disappears”: it becomes the latest revision.

* * *

### 3\. Inspecting revisions

- `kubectl rollout history deployment/nginx-deployment --revision=2 -o yaml`
    
- Shows the pod template used for that revision.
    
- You can compare revisions to see exactly which spec changed.
    

* * *

### 4\. Adding a change cause

- You can annotate the Deployment so that rollouts show **why a change happened**.
    
- Declaratively in YAML:
    
    ```yaml
    metadata:
      annotations:
        kubernetes.io/change-cause: "Update nginx to tag 1.27.0-alpine"
    ```
    
- Imperatively from CLI:
    
    ```bash
    kubectl annotate deployment nginx-deployment \
      kubernetes.io/change-cause="Update nginx to tag 1.27.1-alpine"
    ```
    
- These annotations don’t change the YAML file, but they appear in:
    
    - `kubectl describe deployment`
        
    - `kubectl rollout history`
        

* * *

### 5\. Why this matters in real projects

- Rollout history lets you **audit changes** and **roll back safely**.
    
- Annotations give context (like commit messages in Git).
    
- This is especially useful in CI/CD pipelines:
    
    - Deploy → verify rollout → annotate with commit hash or change reason.

* * *

### 6\. Suggested sandbox experiments

- Delete a pod → Deployment recreates it.
    
- Delete a ReplicaSet → Deployment recreates it.
    
- Apply an invalid spec → rollout fails, status shows errors.
    
- Pause a rollout, apply multiple changes, then resume → watch them apply together.
    

This hands-on experimentation is the best way to really understand how Deployments behave.

* * *

&nbsp;

# Hands-On: Scaling Deployments with Kubectl

  

1.  **Imperative Scaling**
    
    - Command:
        
        ```bash
        kubectl scale deployment nginx-deployment --replicas=3
        ```
        
    - Immediately adjusts the running replica count (up or down).
        
2.  **Temporary Nature**
    
    - The change is **not written back** to the original YAML manifest.
        
    - If you later run:
        
        ```bash
        kubectl apply -f deployment.yaml
        ```
        
        …the replica count reverts to whatever is specified in the file (e.g., back to 5).
        
3.  **Recommended Practice**
    
    - For **long-term or desired state changes**, always edit the manifest (`spec.replicas`) and re-apply:
        
        ```bash
        kubectl apply -f deployment.yaml
        ```
        
4.  **Legit Use Case for `scale`**
    
    - **Quick restarts:**  
        Scale to zero to kill all pods, then back to the desired number:
        
        ```bash
        kubectl scale deployment nginx-deployment --replicas=0
        kubectl scale deployment nginx-deployment --replicas=5
        ```
        
    - Useful if pods are unhealthy and you just need a fast reset.
        
5.  **Rollout History**
    
    - Scaling with `kubectl scale` does **not** create a new rollout revision, so:
        
        ```bash
        kubectl rollout history deployment nginx-deployment
        ```
        
        …shows no changes.
        

* * *

**Summary:**  
Use `kubectl scale` for **short-term, operational adjustments or restarts**. For anything meant to persist, **edit the YAML and apply** so your cluster state matches source control and won’t unexpectedly revert.

# Troubleshooting Failed Rollouts

## 1\. Triggering a Failed Rollout

- **Example failure:** Push a Deployment manifest with an **invalid image tag** (e.g., typo in `nginx:1.27.1` → `nginx:1271`).
    
- Apply it:
    
    ```bash
    kubectl apply -f nginx-deployment.yaml
    ```
    
- Kubernetes begins a rolling update but **new pods never become Ready**.
    

* * *

## 2\. Observing the Symptoms

- `kubectl get deploy`
    
    - Shows *desired* replicas vs. *available* pods (e.g., 5 desired, only 4 available).
- `kubectl describe deploy nginx-deployment`
    
    - Confirms rollout is stuck but not very detailed.

* * *

## 3\. Digging Into Pods

- List pods:
    
    ```bash
    kubectl get pods
    ```
    
    - Some pods show `ImagePullBackOff`.
- Describe a failing pod:
    
    ```bash
    kubectl describe pod <pod-name>
    ```
    
    - **Events section** reveals: `Failed to pull image ... manifest not found`.
- **Lesson:** Pod-level events give the clearest reason for startup failure.
    

* * *

## 4\. Deployment’s Built-in Safety

- **Rolling update strategy** keeps old replica set running:
    
    - New pods fail → old pods stay up.
        
    - No downtime even with a bad config.
        
- Check rollout status:
    
    ```bash
    kubectl rollout status deployment/nginx-deployment
    ```
    
    - Stays in “waiting” state.

* * *

## 5\. Emergency Options

- **Quick rollback** to last working version:
    
    ```bash
    kubectl rollout undo deployment/nginx-deployment
    ```
    
    - Immediately redeploys the previous template.
- **But** the bad YAML is still in source control; applying it again will break things again.
    

* * *

## 6\. Permanent Fix

1.  **Edit the manifest** (correct the image tag).
    
2.  Optional sanity check:
    
    ```bash
    kubectl diff -f nginx-deployment.yaml
    ```
    
3.  Apply:
    
    ```bash
    kubectl apply -f nginx-deployment.yaml
    ```
    
4.  Optionally annotate for history clarity:
    
    ```bash
    kubectl annotate deployment nginx-deployment \
      kubernetes.io/change-cause="Fix incorrect image tag"
    ```
    

* * *

## 7\. Rollout History & Generations

- View history:
    
    ```bash
    kubectl rollout history deployment/nginx-deployment
    ```
    
    - Each apply increases the `generation` monotonically.
        
    - `--revision=<n>` shows details of a specific version.
        

* * *

## 8\. Cleanup

- When done:
    
    ```bash
    kubectl delete -f nginx-deployment.yaml
    ```
    
    - Removes deployment, replica sets, and pods.

* * *

### **Key Lessons**

- **Pod events are your best diagnostic tool** for startup failures.
    
- Kubernetes Deployments protect availability with **rolling updates** and **old replica sets**.
    
- **Rollback (`rollout undo`) is for emergencies only**—the true fix is always to correct and reapply the manifest.
    
- Annotating changes keeps rollout history understandable for future debugging.
    

This flow mirrors a real production incident: a bad config slips through CI/CD, pods can’t start, but traffic keeps flowing until you debug and deploy a correct version.