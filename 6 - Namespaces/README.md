# Table of Contents

1. [Introduction to Namespaces](#introduction-to-namespaces)  
    - [What Namespaces Provide](#what-namespaces-provide)  
    - [Key Reasons to Use Them](#key-reasons-to-use-them)  
    - [Built-in Namespaces](#built-in-namespaces)  
    - [Typical Use Cases](#typical-use-cases)  
    - [Working With Namespaces](#working-with-namespaces)  
    - [Best Practices](#best-practices)  

2. [Hands-On: Creating and Managing Namespaces](#hands-on-creating-and-managing-namespaces)  
    - [Create a Namespace (Declarative)](#1-create-a-namespace-declarative)  
    - [Deploy Resources into a Namespace](#2-deploy-resources-into-a-namespace)  
    - [Viewing and Operating on Namespaces](#3-viewing-and-operating-on-namespaces)  
    - [Set a Default Namespace for Your Session](#4-set-a-default-namespace-for-your-session)  
    - [Inspect Context and Namespace](#5-inspect-context-and-namespace)  
    - [Deleting a Namespace](#6-deleting-a-namespace)  

3. [Hands-On: Cross-Namespace Service Communication](#hands-on-cross-namespace-service-communication)  
    - [Service and Backend Pod (Namespace: `dev`)](#1-service-and-backend-pod-namespace-dev)  
    - [Client Pod in Another Namespace (default)](#2-client-pod-in-another-namespace-default)  
    - [Why the FQDN Matters](#3-why-the-fqdn-matters)  
    - [Verify](#4-verify)  
    - [Cleanup](#5-cleanup)  

# Introduction to Namespaces

&nbsp;

## What Namespaces Provide

- **Logical isolation** inside a single physical cluster.
    
- Separate “rooms” in the same house so teams, environments, or applications don’t interfere with one another.
    

* * *

## Key Reasons to Use Them

1.  **Environment separation**  
    Dev, staging, and production can share hardware but remain isolated.
    
2.  **Resource protection**  
    Pairing namespaces with **ResourceQuotas** prevents one group from exhausting CPU or memory across the whole cluster.
    
3.  **Security and access control**  
    Combine with **RBAC** so different teams or service accounts have distinct permissions.
    
4.  **Organization**  
    Keep large clusters manageable by grouping related resources.
    

* * *

## Built-in Namespaces

- **default** – Where resources go if no namespace is specified.
    
- **kube-system** – Kubernetes control plane components and add-ons.
    
- **kube-public** – Publicly readable data (e.g., cluster info).
    
- **kube-node-lease** – Tracks node heartbeats for availability checks.
    

* * *

## Typical Use Cases

- Multi-tenant clusters with multiple teams.
    
- Environment-based isolation (dev, test, prod).
    
- Monitoring/observability tools that run cluster-wide in their own namespace.
    

* * *

## Working With Namespaces

- **Specify in manifests**:
    
    ```yaml
    metadata:
      name: my-app
      namespace: dev
    ```
    
- **Command-line**:
    
    ```bash
    kubectl get pods -n dev
    kubectl config set-context --current --namespace=dev   # set default for this context
    ```
    
- **Cross-namespace service calls**: use the fully qualified service name  
    `service-name.namespace.svc.cluster.local`
    

* * *

## Best Practices

- **Don’t overuse**: Create namespaces only when you need isolation or separate policies.
    
- **Combine with RBAC** for fine-grained access control.
    
- **Apply ResourceQuotas and LimitRanges** to prevent resource hogging.
    
- **Choose clear naming dimensions** (by team, environment, or application) so others can easily understand the structure.
    

* * *

**Summary**  
Namespaces let you share cluster hardware while keeping workloads organized, resource-bounded, and secure. Use them where true isolation or differentiated policies are required, not just by default.



&nbsp;

# Hands-On: Creating and Managing Namespaces

* * *

## 1\. Create a Namespace (Declarative)

**dev-ns.yaml**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dev
```

Apply it:

```bash
kubectl apply -f dev-ns.yaml
```

List all namespaces:

```bash
kubectl get namespaces
```

* * *

## 2\. Deploy Resources into a Namespace

Add the namespace under `metadata` in the manifest:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: color-api
  namespace: dev
spec:
  containers:
  - name: color-api
    image: marcos1503/color-api:1.1.0
    ports:
    - containerPort: 80
```

Apply as usual:

```bash
kubectl apply -f color-api.yaml
```

* * *

## 3\. Viewing and Operating on Namespaces

- Default commands look only at the **default** namespace:
    
    ```bash
    kubectl get pods        # only default ns
    ```
    
- Specify namespace explicitly:
    
    ```bash
    kubectl get pods -n dev
    kubectl describe pod color-api -n dev
    ```
    
- View everything across namespaces:
    
    ```bash
    kubectl get pods --all-namespaces   # or -A
    ```
    

* * *

## 4\. Set a Default Namespace for Your Session

Avoid repeating `-n`:

```bash
# Check current context
kubectl config current-context

# Set namespace for current context
kubectl config set-context --current --namespace=dev

# Commands now default to dev
kubectl get pods
kubectl describe pod color-api
```

**Be careful**: destructive commands (e.g., `kubectl delete`) will run against this namespace until you change it back.

To reset:

```bash
kubectl config set-context --current --namespace=default
```

* * *

## 5\. Inspect Context and Namespace

```bash
kubectl config view --minify | grep namespace:
```

Shows which namespace the current context targets.

* * *

## 6\. Deleting a Namespace

```bash
kubectl delete -f dev-ns.yaml
# or
kubectl delete namespace dev
```

**Important:** deleting a namespace removes **all resources inside it** (pods, deployments, services, etc.).

* * *

### Best Practices

- Limit who can manage or delete namespaces using **RBAC**.
    
- Remember that context changes persist—double-check with `kubectl config view` before running destructive commands.
    
- Use namespaces when you need **logical isolation** (environments, teams, projects), but avoid creating them unnecessarily.
    

This gives you the full cycle: create → use → set context → inspect → safely delete, while keeping the critical precautions in mind.

# Hands-On: Cross-Namespace Service Communication

* * *

## 1\. Service and Backend Pod (Namespace: `dev`)

**color-api-service.yaml**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: color-api
  namespace: dev
  labels:
    app: color-api
spec:
  containers:
  - name: color-api
    image: marcos1503/color-api:1.1.0
    ports:
    - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: color-api-svc
  namespace: dev
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


```

&nbsp;

Apply them (ensure the namespace already exists):

```bash
kubectl apply -f color-api-pod.yaml
kubectl apply -f color-api-service.yaml
```

* * *

## 2\. Client Pod in Another Namespace (default)

**traffic-generator.yaml**

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
      image: marcos1503/traffic-generator:1.0.0
      args: 
        - "http://color-api.dev.svc.cluster.local/api"  # Fully Qualified Domain Name
        - "1s"                                         # interval between requests
```

Apply:

```bash
kubectl apply -f traffic-generator.yaml
```

* * *

## 3\. Why the FQDN Matters

*Inside the same namespace* you can use just the Service name:

```
http://color-api
```

*Across namespaces* you must use:

```
<service-name>.<namespace>.svc.cluster.local
```

Breaking it down:

- **service-name** – `color-api`
    
- **namespace** – `dev`
    
- **svc.cluster.local** – the cluster’s internal domain suffix
    

* * *

## 4\. Verify

```bash
# Check objects
kubectl get pods -n dev
kubectl get svc  -n dev
kubectl get pods           # traffic-generator in default namespace

# Tail the client logs
kubectl logs traffic-generator
```

You should see repeated HTTP responses from the color-api service.

* * *

## 5\. Cleanup

Delete everything with one command if the YAMLs are in a single folder:

```bash
kubectl delete -f .
```

(Remember: deleting the `dev` namespace itself will also remove the Service and Pod within it.)

* * *

**Key Takeaway**  
When a Pod in one namespace needs to reach a Service in another, use the fully qualified domain name:

```
service-name.namespace.svc.cluster.local
```

This pattern ensures reliable DNS resolution across namespace boundaries.