# Index

1. [Labels and Selectors](#labels-and-selectors)
    - [Labels](#labels)
    - [Selectors](#selectors)
    - [Types of Selectors](#types-of-selectors)
      - [Equality-Based](#1-equality-based)
      - [Set-Based](#2-set-based)
    - [Key Points](#key-points)
2. [Hands-On: Labels and Selectors in Kubectl](#hands-on-labels-and-selectors-in-kubectl)
    - [Create the YAML Manifest](#1-create-the-yaml-manifest)
    - [Apply the Manifest](#2-apply-the-manifest)
    - [Display Labels in Output](#3-display-labels-in-output)
    - [Filter Pods with Equality-Based Selectors](#4-filter-pods-with-equality-based-selectors)
    - [Filter Pods with Set-Based Selectors](#5-filter-pods-with-set-based-selectors)
3. [Hands-On: Selecting Objects with MatchLabels and MatchExpressions](#hands-on-selecting-objects-with-matchlabels-and-matchexpressions)
    - [Deployment YAML Example](#1-deployment-yaml-example)
    - [Apply and Verify](#2-apply-and-verify)
    - [Why Use `matchExpressions`](#3-why-use-matchexpressions)
    - [Best Practices](#4-best-practices)
4. [Annotations](#annotations)
    - [Purpose](#purpose)
    - [Common Uses](#common-uses)
    - [Key Differences from Labels](#key-differences-from-labels)
    - [Structure](#structure)
    - [Practical Notes](#practical-notes)

# Labels and Selectors

### Labels

- **Definition**: Key–value pairs attached to objects such as Pods, Nodes, Services, Deployments, and ReplicaSets.
    
- **Purpose**: Provide metadata to identify, group, and organize resources.
    
- **Not Unique**: Multiple objects can share the same label, unlike object names that must be unique within a namespace.
    

Typical uses:

- Identify application or tier: `app: color-api`, `tier: backend`

* * *

### Selectors

- **Definition**: Filters that match objects based on labels.
    
- **Usage**: Required by Services, ReplicaSets, and NetworkPolicies; also used with `kubectl` commands.
    

* * *

### Types of Selectors


**1\. Equality-Based**

- Match exact key–value pairs.
    
- Operators: `=` or `==` and `!=` (CLI only).
    
- YAML example:
    
    ```yaml
    selector:
      matchLabels:
        app: color-api
        tier: backend
    ```
    
    Returns pods where both `app: color-api` and `tier: backend`.
    

**2\. Set-Based**

- More flexible; use `In`, `NotIn`, `Exists`, `DoesNotExist`.
    
- YAML example:
    
    ```yaml
    selector:
      matchExpressions:
        - key: tier
          operator: In
          values: ["frontend", "backend"]
    ```
    
    Matches pods with `tier` equal to `frontend` or `backend`.
    
- Exclude canary:
    
    ```yaml
    selector:
      matchExpressions:
        - key: release
          operator: NotIn
          values: ["canary"]
    ```
    
- Key existence only:
    
    ```yaml
    selector:
      matchExpressions:
        - key: env
          operator: Exists
    ```
    

### Key Points

- All conditions in `matchExpressions` are combined with a logical AND.
    
- Services route traffic only to pods matching their selector.
    
- Adding or removing a label from a running object instantly changes which selectors match it.
    

This combination of labels and selectors provides a dynamic, declarative way to group and target Kubernetes resources.

# Hands-On: Labels and Selectors in Kubectl

Here’s a clean walk-through you can follow to practice exactly what was described, without any extra symbols or emoticons.

* * *

## 1\. Create the YAML Manifest

Create a file named **color-api.yaml** with two Pod definitions:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: color-backend
  labels:
    app: color-api
    environment: local
    tier: backend
spec:
  containers:
  - name: color-backend
    image: lm-academy/color-api:1.1.0
    ports:
    - containerPort: 80
---
apiVersion: v1
kind: Pod
metadata:
  name: color-frontend
  labels:
    app: color-api
    environment: local
    tier: frontend
spec:
  containers:
  - name: color-frontend
    image: nginx:1.27.0
    ports:
    - containerPort: 80
```

Save this file in an empty directory.

* * *

## 2\. Apply the Manifest

```bash
kubectl apply -f color-api.yaml
```

Check that both Pods are running:

```bash
kubectl get pods
```

You should see `color-backend` and `color-frontend` in a Running state.

* * *

## 3\. Display Labels in Output

Show the `app` label column:

```bash
kubectl get pods -L app
```

Show both `app` and `tier` label columns:

```bash
kubectl get pods -L app -L tier
```

* * *

## 4\. Filter Pods with Equality-Based Selectors

Return only the frontend pod:

```bash
kubectl get pods -l tier=frontend
```

Return only the backend pod:

```bash
kubectl get pods -l tier=backend
```

Combine conditions (logical AND) to match both `app` and `tier`:

```bash
kubectl get pods -l 'app=color-api,tier=frontend'

```

Use multiple `-l` flags for an OR-like effect:

```bash
kubectl get pods -l app=color-api -l tier=frontend
```

* * *

## 5\. Filter Pods with Set-Based Selectors

Match either frontend or backend tiers:

```bash
kubectl get pods -l 'tier in (frontend,backend)'
```

Exclude the frontend tier:

```bash
kubectl get pods -l 'tier notin (frontend)'
```

Return pods that simply have the `environment` label, regardless of value:

```bash
kubectl get pods -l 'environment'
```

* * *

&nbsp;

# Hands-On: Selecting Objects with MatchLabels and MatchExpressions

## 1\. Deployment YAML Example

Create a file named **color-deploy.yaml**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: color-api
  labels:
    app: color-api
    environment: local
    tier: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: color-api
      environment: local
      tier: backend
    matchExpressions:
      - key: managed
        operator: Exists
      # Optional extra example:
      # - key: tier
      #   operator: In
      #   values: ["backend", "cache"]
  template:
    metadata:
      labels:
        app: color-api
        environment: local
        tier: backend
        managed: "true"     # Critical for the Exists operator
    spec:
      containers:
      - name: color-backend
        image: lm-academy/color-api:1.1.0
        ports:
        - containerPort: 80
```

Key points:

- **replicas: 3** scales the Deployment to three Pods.
    
- **matchLabels** defines straightforward equality matches.
    
- **matchExpressions** adds more advanced logic (Exists, In, NotIn, etc.).
    
- The template must include `managed: "true"` so that Pods created by this Deployment satisfy the Exists condition.
    

* * *

## 2\. Apply and Verify

```bash
kubectl apply -f color-deploy.yaml
kubectl get pods -L app,tier,environment,managed
```

You should see three Pods created by the Deployment, each with the `managed` label.

If you also had a standalone Pod with the same `app`, `environment`, and `tier` labels but **without** `managed`, it would not be controlled by this Deployment because it fails the `managed Exists` requirement.

* * *

## 3\. Why Use `matchExpressions`

- **Exists / DoesNotExist**: Match purely on the presence or absence of a key.
    
- **In / NotIn**: Allow or exclude multiple possible values without listing every alternative.
    
- Useful for **node selectors**, **affinity/anti-affinity**, and **advanced Service selectors**, not only Deployments.
    

* * *

## 4\. Best Practices

- Keep Deployment selectors simple. Complex set-based selectors can accidentally overlap with other Deployments and cause unpredictable scaling behavior.
    
- Reserve advanced matchExpressions for situations like node placement or specialized scheduling, where more complex logic is necessary.
    

* * *

This pattern—`matchLabels` for the common case and `matchExpressions` for special conditions—is widely used across Kubernetes resources such as Deployments, ReplicaSets, Services, and scheduling constraints.

# Annotations

## Purpose

- **Annotations** are key–value pairs attached to Kubernetes objects (Pods, Deployments, Services, etc.).
    
- They hold **non-identifying** metadata, usually meant for tools, controllers, or the Kubernetes system itself—not for selecting or grouping resources.
    

* * *

## Common Uses

1.  **Tool-specific metadata**
    
    - Monitoring or logging agents can store configuration data or custom tags.
2.  **Ingress controller configuration**
    
    - For example, NGINX ingress annotations that enable HTTPS redirection or set path-rewrite rules.
3.  **Build and version details**
    
    - Commit hash, build timestamp, or image version for quick troubleshooting.
4.  **Runtime hints for operators/controllers**
    
    - Certain operators read annotations to adjust their behavior dynamically.

* * *

## Key Differences from Labels

- **Not for selection**: You cannot filter or group objects with `kubectl get … -l` using annotations.
    
- **Intended for tools and automation**, not for human grouping logic.
    

* * *

## Structure

- **Key format**: Optional prefix and a name.
    
    - Prefix must be a valid DNS subdomain (e.g., `nginx.ingress.kubernetes.io`).
        
    - Name must be ≤63 characters and use lowercase letters, numbers, `-`, `_`, or `.`.
        
    - If no prefix is given, it’s considered a user-defined (private) annotation.
        

Example:

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    build.commit.hash: "a1b2c3d4"
    user-note: "Deployed for internal testing"
```

* * *

## Practical Notes

- **System components often add their own annotations** automatically.
    
- **You can freely add custom annotations** for internal tracking or automation, but keep keys short and meaningful.
    
- Because annotations are not indexed for selection, they are safe for storing large or frequently changing metadata that you don’t want to use in queries.
    

* * *

&nbsp;