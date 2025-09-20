# Index

1. [Introduction to Kubernetes](#introduction-to-kubernetes)  
    1.1 [What is Kubernetes?](#1-what-is-kubernetes)  
    1.2 [Why Kubernetes?](#2-why-kubernetes)  
    1.3 [Declarative vs Imperative](#3-declarative-vs-imperative)  
    1.4 [Resilience in Practice](#4-resilience-in-practice)  
    1.5 [Kubernetes Architecture Overview](#5-kubernetes-architecture-overview)  

2. [Kubernetes Architecture](#kubernetes-architecture)  
    2.1 [Control Plane (Master Node)](#control-plane-master-node)  
    2.2 [Worker Nodes (Data Plane)](#worker-nodes-data-plane)  
    2.3 [Communication Flow](#communication-flow)  
    2.4 [Summary](#summary)  

3. [Running Containers at Scale – Why Kubernetes?](#running-containers-at-scale--why-kubernetes)  
    3.1 [Container Scheduling](#1-container-scheduling)  
    3.2 [Load Balancing](#2-load-balancing)  
    3.3 [Scaling Applications](#3-scaling-applications)  
    3.4 [Self-Healing](#4-self-healing)  
    3.5 [Service Discovery](#5-service-discovery)  
    3.6 [Configuration Management](#6-configuration-management)  
    3.7 [Extensibility](#7-extensibility)  

4. [kubectl (Kubernetes CLI)](#kubectl-kubernetes-cli)  
    4.1 [Overview](#kubectl-overview)  
    4.2 [Command Structure](#command-structure)  
    4.3 [Main Use Cases](#main-use-cases)  
    4.4 [kube-system](#kube-system)  

5. [Course Practice](#course-practice)  
    5.1 [Hands-on Practice with kubectl](#consistent-hands-on-practice-with-kubectl)  
    5.2 [Reinforcing Concepts](#reinforce-concepts-by-working-directly-with-the-cluster)  

# Introduction to Kubernetes

### 1\. What is Kubernetes?

- Define Kubernetes and its purpose.
    
- Explore **why we use it** and the **challenges it solves** (scalability, resilience, automation).
    

* * *

### 2\. Kubernetes Architecture

- **Control Plane vs Data Plane**: separation of responsibilities.
    
- **Nodes and cluster objects**: their roles and interactions.
    

* * *

### 3\. kubectl (Kubernetes CLI)

- Understand what `kubectl` is vs. what the **cluster** is.
    
- How `kubectl` communicates with the cluster.
    
- General structure and usage of `kubectl` commands.
    

* * *

### 4\. Course Practice

- Consistent hands-on practice with `kubectl`.
    
- Reinforce concepts by working directly with the cluster.
    

# Running Containers at Scale – Why Kubernetes?

### 1\. Container Scheduling

- **Docker:** Manual, error-prone, and not designed for distributing workloads across servers.
    
- **Kubernetes:** Declarative scheduling based on resource definitions; automated placement of pods across nodes.
    

* * *

### 2\. Load Balancing

- **Docker:** No built-in load balancing, only direct communication via container names.
    
- **Kubernetes:** **Services** abstract pods and handle built-in load balancing across them.
    

* * *

### 3\. Scaling Applications

- **Docker:** Requires manual creation/configuration of containers; low-level adjustments.
    
- **Kubernetes:** **Horizontal Pod Autoscaler (HPA)** scales pods automatically based on metrics (CPU, memory, custom).
    

* * *

### 4\. Self-Healing

- **Docker:** Basic restart policies, limited to container exit status.
    
- **Kubernetes:** Health checks, continuous monitoring, and rescheduling unhealthy pods for robust recovery.
    

* * *

### 5\. Service Discovery

- **Docker:** Basic name-based communication; no scalable solution.
    
- **Kubernetes:** Internal **DNS + Services** enable reliable service discovery at scale.
    

* * *

### 6\. Configuration Management

- **Docker:** Requires manual, low-level config replication.
    
- **Kubernetes:** **ConfigMaps** and **Secrets** decouple and scale application configuration.
    

* * *

### 7\. Extensibility

- **Docker:** Limited in scope.
    
- **Kubernetes:** Designed to be extensible, with a vast ecosystem of tools for production workloads.
    

* * *

👉 **Bottom line:**  
Docker and Docker Compose are great for small-scale or development setups. But for **production workloads at scale**, Kubernetes provides scheduling, scaling, resiliency, service discovery, and configuration management — all essential for running modern distributed systems.

&nbsp;

&nbsp;

# Introduction to Kubernetes

### 1\. What is Kubernetes?

- **Open-source** container orchestration platform.
    
- **Created by Google**, released in **2014**.
    
- Has become the **de facto industry standard** for running containers at scale.
    
- Backed by a **huge ecosystem** and designed to be **extensible** (many companies build tools/services on top of it).
    

* * *

### 2\. Why Kubernetes?

- Addresses the **complexities of running containers in production**.
    
- Built around key principles:
    
    1.  **Automation** – reduces manual intervention in deployment & management.
        
    2.  **Declarative Style** – we declare the desired state, and Kubernetes continuously ensures reality matches it.
        
    3.  **Scalability** – makes horizontal scaling of applications simple and reliable.
        
    4.  **Resilience** – ensures apps stay available even if nodes fail; supports self-healing and safe rolling updates.
        

* * *

### 3\. Declarative vs Imperative

- **Imperative (e.g., Java, Python, JS):** Explicit instructions step by step.
    
- **Declarative (Kubernetes):** Define the *desired end state* → Kubernetes figures out how to achieve and maintain it.
    

* * *

### 4\. Resilience in Practice

- Automatically reschedules pods when nodes/VMs fail.
    
- Supports gradual, **fail-safe rollouts** of new versions (rolling updates).
    

* * *

### 5\. Kubernetes Architecture Overview

- **Control Plane (the "brain")**
    
    - Manages the cluster, monitors state, enforces the declared configuration.
- **Worker Nodes**
    
    - The machines (VMs or physical servers) where applications (pods/containers) actually run.

* * *

&nbsp;

# Kubernetes Architecture

&nbsp;

### Control Plane (Master Node)

The control plane is the brain of the Kubernetes cluster, responsible for maintaining the desired state of the system, making global decisions, and managing the lifecycle of applications. Key components include:

- **API Server (`kube-apiserver`)**: Acts as the front-end for the Kubernetes control plane, exposing the Kubernetes API. It processes REST operations, validates them, and updates the corresponding objects in `etcd`. All communication with the cluster, including commands from `kubectl`, interacts with the API server.([Wikipedia](https://en.wikipedia.org/wiki/Kubernetes?utm_source=chatgpt.com "Kubernetes"))
    
- **etcd**: A consistent and highly-available key-value store used as Kubernetes' backing store for all cluster data. It holds the configuration data and state of the cluster, ensuring consistency across the system.([Kubernetes](https://kubernetes.io/docs/concepts/overview/components/?utm_source=chatgpt.com "kubernetes.io/docs/conce..."))
    
- **Scheduler (`kube-scheduler`)**: Assigns newly created pods to nodes based on resource availability and other constraints. It ensures that workloads are efficiently distributed across the cluster.
    
- **Controller Manager (`kube-controller-manager`)**: Runs controllers that regulate the state of the system, such as ensuring the desired number of pod replicas are running and managing endpoints.
    
- **Cloud Controller Manager (optional)**: Integrates with the underlying cloud provider's API to manage cloud-specific resources, allowing Kubernetes to interact with the cloud infrastructure.([Kubernetes](https://kubernetes.io/docs/concepts/overview/components/?utm_source=chatgpt.com "kubernetes.io/docs/conce..."))
    

For high availability, it's recommended to run multiple instances of the control plane components across different nodes.

* * *

###  Worker Nodes (Data Plane)

Worker nodes are the machines where application workloads run. Each node contains the necessary components to run pods and communicate with the control plane:

- **kubelet**: An agent that runs on each node. It ensures that containers are running in a pod and communicates with the control plane to report the node's status.
    
- **Container Runtime**: Software responsible for running containers. Examples include Docker, containerd, and CRI-O.([Kubernetes](https://kubernetes.io/docs/concepts/overview/components/?utm_source=chatgpt.com "kubernetes.io/docs/conce..."))
    
- **kube-proxy**: Maintains network rules on nodes. It enables network communication to your pods from network sessions inside or outside of your cluster.([Kubernetes](https://kubernetes.io/docs/concepts/overview/components/?utm_source=chatgpt.com "kubernetes.io/docs/conce..."))
    

These components work together to ensure that applications are running as intended and can scale based on demand.

* * *

### Communication Flow

Communication within a Kubernetes cluster follows a hub-and-spoke model centered around the API server:

- **User Interaction**: Users typically interact with the cluster using the `kubectl` command-line tool or the Kubernetes Dashboard. These tools send requests to the API server.
    
- **API Server**: Acts as the central point of communication, processing requests and updating the cluster state in `etcd`.([Wikipedia](https://en.wikipedia.org/wiki/Kubernetes?utm_source=chatgpt.com "Kubernetes"))
    
- **Controller Manager**: Monitors the state of the cluster and makes adjustments as needed to maintain the desired state.
    
- **Scheduler**: Assigns pods to nodes based on resource availability.([appvia.io](https://www.appvia.io/blog/components-of-kubernetes-architecture?utm_source=chatgpt.com "Basic Components of Kubernetes Architecture"))
    
- **kubelet**: Ensures that containers are running in a pod and reports back to the API server.
    
- **kube-proxy**: Manages network communication to and from pods.
    

This architecture allows Kubernetes to maintain a desired state, ensuring that applications are deployed, scaled, and managed efficiently.

* * *

###  Summary

Kubernetes' architecture is designed for scalability, resilience, and efficient management of containerized applications. The control plane manages the overall state and decisions of the cluster, while the worker nodes execute the workloads. Understanding this architecture is crucial for effectively deploying and managing applications in a Kubernetes environment.

* * *

For a visual representation of the Kubernetes architecture, you can refer to the official Kubernetes documentation:

([Kubernetes](https://kubernetes.io/docs/concepts/overview/components/?utm_source=chatgpt.com "kubernetes.io/docs/conce..."))

* * *

Kubernetes is a powerful container orchestration platform that enables the deployment, scaling, and management of containerized applications. At its core, Kubernetes operates through a distributed architecture comprising two main planes: the control plane and the data plane.

* * *

##  Control Plane: The Brain of Kubernetes

The control plane is responsible for managing the overall state of the cluster, making global decisions about the cluster (for example, scheduling), as well as detecting and responding to cluster events (for example, starting up a new pod when a Deployment's `replicas` field is unsatisfied). It consists of several key components:([Kubernetes](https://kubernetes.io/docs/concepts/architecture/?utm_source=chatgpt.com "Cluster Architecture"))

### 1\. API Server (`kube-apiserver`)

The API server serves as the front end for the Kubernetes control plane. It exposes the Kubernetes API, handling external and internal requests, determining whether a request is valid, and processing it accordingly. All interactions with the cluster, such as creating, updating, or retrieving resources, are routed through the API server. Tools like `kubectl` communicate with the API server to perform these operations. ([Kubernetes](https://kubernetes.io/docs/concepts/architecture/?utm_source=chatgpt.com "Cluster Architecture"), [Spot.io](https://spot.io/resources/kubernetes-architecture/11-core-components-explained/?utm_source=chatgpt.com "Kubernetes Architecture: Control Plane, Data Plane ... - Spot.io"))

### 2\. Scheduler (`kube-scheduler`)

The scheduler watches for newly created Pods that have no assigned node and selects a node for them to run on. Factors considered during scheduling include resource requirements, hardware/software/policy constraints, affinity and anti-affinity specifications, data locality, inter-workload interference, and deadlines. ([Kubernetes](https://kubernetes.io/docs/concepts/architecture/?utm_source=chatgpt.com "Cluster Architecture"))

### 3\. Controller Manager (`kube-controller-manager`)

The controller manager runs controller processes that handle routine tasks in the cluster. Each controller is a separate process, but to reduce complexity, they are all compiled into a single binary and run in a single process. Examples of controllers include:([Kubernetes](https://kubernetes.io/docs/concepts/architecture/?utm_source=chatgpt.com "Cluster Architecture"))

- **Node Controller**: Responsible for noticing and responding when nodes go down.([Kubernetes](https://kubernetes.io/docs/concepts/architecture/?utm_source=chatgpt.com "Cluster Architecture"))
    
- **ReplicaSet Controller**: Ensures that the desired number of pod replicas are running at any given time.
    
- **Job Controller**: Manages the execution of jobs, ensuring they run to completion.
    

Controllers continuously monitor the state of the cluster and take corrective actions to maintain the desired state.

### 4\. Cloud Controller Manager (`cloud-controller-manager`)

The cloud controller manager lets you link your cluster into your cloud provider's API. It separates the components that interact with the cloud platform from those that only interact with the cluster. This component is useful for managing cloud-specific resources such as load balancers, storage volumes, and node management. If you're running Kubernetes on your own premises, or in a learning environment inside your own PC, the cluster does not have a cloud controller manager. ([Kubernetes](https://kubernetes.io/docs/concepts/architecture/?utm_source=chatgpt.com "Cluster Architecture"))

### 5\. etcd

Etcd is a consistent and highly-available key-value store used as Kubernetes' backing store for all cluster data. It stores all cluster data, representing the overall state of the cluster at any given point in time. The API server reads from and writes to etcd, ensuring that the cluster's state is accurately maintained. ([Kubernetes](https://kubernetes.io/docs/concepts/architecture/?utm_source=chatgpt.com "Cluster Architecture"), [Wikipedia](https://en.wikipedia.org/wiki/Kubernetes?utm_source=chatgpt.com "Kubernetes"))

* * *

##  Worker Nodes: The Execution Units

While the control plane manages the cluster, the worker nodes are responsible for running the containerized applications. Each worker node contains several key components:([devopscube.com](https://devopscube.com/kubernetes-architecture-explained/?utm_source=chatgpt.com "Kubernetes Architecture: The Definitive Guide (2025)"))

- **Kubelet**: An agent that runs on each node in the cluster. It ensures that containers are running in a Pod.([DEV Community](https://dev.to/spacelift/kubernetes-control-plane-what-it-is-how-it-works-44ch?utm_source=chatgpt.com "Kubernetes Control Plane: What It Is & How It Works"))
    
- **Container Runtime**: The software responsible for running containers. Examples include Docker, containerd, and CRI-O.([Apptio](https://www.apptio.com/blog/kubernetes-components/?utm_source=chatgpt.com "Core Kubernetes components"))
    
- **Kube Proxy**: Maintains network rules for Pod communication. It enables network connectivity to Pods from network sessions inside or outside of your cluster.
    

These components work together to execute the workloads defined by the control plane.

* * *

## Communication Flow in Kubernetes

Communication within a Kubernetes cluster follows a structured flow:

1.  **User Interaction**: Users interact with the cluster using tools like `kubectl`, which sends requests to the API server.
    
2.  **API Server**: The API server processes these requests and updates the desired state in etcd.([Wikipedia](https://en.wikipedia.org/wiki/Kubernetes?utm_source=chatgpt.com "Kubernetes"))
    
3.  **Scheduler**: If new Pods are created, the scheduler assigns them to appropriate nodes based on resource availability and constraints.
    
4.  **Controller Manager**: Controllers monitor the cluster state and take corrective actions to maintain the desired state.
    
5.  **Worker Nodes**: The kubelet on each worker node ensures that the containers are running as expected.
    

This continuous loop ensures that the cluster operates efficiently and maintains the desired state.

* * *

## High Availability and Fault Tolerance

To ensure high availability and fault tolerance, it's recommended to have multiple replicas of critical control plane components:

- **API Server**: Run multiple instances behind a load balancer.
    
- **Controller Manager**: Run multiple instances to handle controller processes.
    
- **etcd**: Set up a clustered etcd with an odd number of members (e.g., 3 or 5) to maintain quorum.
    

By distributing these components across different nodes, the cluster can tolerate failures and continue to operate without disruption.

&nbsp;

##  Worker Node Components in Kubernetes

### 1\. **Kubelet**

- Agent running on every worker node.
    
- Talks to the **API Server** (control plane).
    
- Ensures **containers inside Pods are running** as specified in the Pod manifest.
    
- Constantly checks actual vs. desired state of Pods.
    

### 2\. **Container Runtime**

- The software that actually runs containers.
    
- Options include **Docker**, **containerd**, **CRI-O**.
    
- Provides the **execution environment** for Pods.
    

### 3\. **Kube Proxy**

- Handles **network rules** and service connectivity.
    
- Maintains **load balancing** and ensures traffic reaches the correct Pod.
    
- Works closely with Kubernetes **Services**.
    

* * *

## Higher-Level Kubernetes Objects (Optional but Common)

- **ReplicaSets, Deployments, StatefulSets, Jobs, Services, Ingresses, etc.**
    
- They are **not mandatory** (a cluster could technically run only Pods).
    
- In practice, you will almost always use them.
    
- They rely on:
    
    - **Controllers** (in the control plane) to reconcile desired vs actual state.
        
    - Lower-level components like kubelet, kube-proxy, and the runtime to do the real work.
        

* * *

## Big Picture

- **Control Plane = brains** → decides *what* should run and ensures state consistency.
    
- **Worker Nodes = muscles** → actually run Pods (via kubelet + runtime + networking).
    
- **Higher-level objects** (like Deployments/Services) are abstractions built on top of these basics.
    

* * *


##  `kubectl` Overview

- **Primary CLI** for interacting with Kubernetes clusters.
    
- Translates your commands → **API requests** → sent to the **API server** (control plane).
    
- Manages **all Kubernetes resources** (Pods, Services, Deployments, etc.).
    

* * *

## Command Structure

```bash
kubectl <command> <resource-type> <resource-name> [flags]
```

Examples:

```bash
kubectl get pods
kubectl describe pod my-pod
kubectl delete deployment my-deployment
```

* * *

## Main Use Cases

### 1\. **Inspecting Resources**

Used to *observe* cluster state.

- `kubectl get` → lists resources
    
- `kubectl describe` → detailed info on a resource
    
- `kubectl logs` → view container logs
    

👉 Example:

```bash
kubectl get pods
kubectl describe service my-service
kubectl logs my-pod
```

* * *

### 2\. **Imperative Resource Management**

Directly *create / modify / delete* resources via commands.

- `kubectl run`
    
- `kubectl create`
    
- `kubectl scale`
    
- `kubectl delete`
    

👉 Example:

```bash
kubectl create deployment nginx --image=nginx
kubectl scale deployment nginx --replicas=3
```

* * *

### 3\. **Declarative Resource Management**

Apply configs from YAML/JSON manifests → ensures **desired state**.

- `kubectl apply` → create/update from file
    
- `kubectl diff` → see changes before applying
    

👉 Example:

```bash
kubectl apply -f deployment.yaml
kubectl diff -f deployment.yaml
```

* * *

##  Big Picture

- **Inspecting** → See what’s running.
    
- **Imperative** → Quick, one-off changes (good for testing).
    
- **Declarative** → GitOps / production-friendly way (preferred for real environments).
    

* * *

### kube-system

```bash
kubectl get pods -n kube-system
```

&nbsp;

Running the command returns a table with columns such as:

```
NAME                                   READY   STATUS    RESTARTS   AGE
coredns-7b6c9b8d99-2pxkx               1/1     Running   0          3h
etcd-minikube                          1/1     Running   0          3h
kube-apiserver-minikube                 1/1     Running   0          3h
...
```

These are the **control-plane and cluster-level pods** that keep Kubernetes itself running.  
Typical components you’ll see include:

- **coredns** – internal DNS service that lets you reach services by name (`my-service.default.svc.cluster.local`).
    
- **kube-apiserver** – the main API endpoint that `kubectl` talks to.
    
- **kube-scheduler** – decides which node each pod runs on.
    
- **kube-controller-manager** – runs the cluster’s background controllers (replicas, endpoints, etc.).
    
- **etcd** – key-value database that stores the cluster’s state.
    
- **kube-proxy** (often runs as a daemonset on every node) – manages network rules for service discovery.
    

The exact list varies depending on your Kubernetes distribution (minikube, EKS, GKE, etc.), but these are the core system pods.

* * *

### Why it’s useful

- **Health check**: Quickly see if critical control-plane pods are running and ready.
    
- **Troubleshooting**: If DNS or scheduling breaks, you can check logs of the relevant pod:
    
    ```bash
    kubectl logs -n kube-system coredns-<pod-name>
    ```
    
- **Monitoring**: Verify that upgrades or node failures haven’t left system pods in `CrashLoopBackOff` or other error states.
    

* * *

**Summary:**  
`kubectl get pods -n kube-system` lists the essential, cluster-internal Kubernetes services running as pods in the `kube-system` namespace, letting you inspect and manage the infrastructure that makes the cluster itself function.

