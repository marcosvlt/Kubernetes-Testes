# Index

- [Introduction to Volume](#introduction-to-volume)
    - [Why Volumes Exist](#1-why-volumes-exist)
    - [How Volumes Work](#2-how-volumes-work)
    - [Pod Specification](#3-pod-specification)
    - [Common Volume Types](#4-common-volume-types)
    - [Storage Backends](#5-storage-backends)
    - [Lifecycle Notes](#6-lifecycle-notes)

- [EmptyDir and Local Volumes](#emptydir-and-local-volumes)
    - [emptyDir](#emptydir)
    - [Local Volume](#local-volume)
    - [Quick Decision Guide](#quick-decision-guide)

- [Hands-On: Working with EmptyDir Ephemeral Storage](#hands-on-working-with-emptydir-ephemeral-storage)

- [Introduction to Persistent Volume Claims](#introduction-to-persistent-volume-claims)
    - [PersistentVolume (PV) and PersistentVolumeClaim (PVC) Overview](#persistentvolume-pv-and-persistentvolumeclaim-pvc-overview)
    - [Binding Rules](#binding-rules)
    - [Provisioning Types](#provisioning-types)
    - [Reclaim Policies](#reclaim-policies-what-happens-when-a-pvc-is-deleted)
    - [Access Modes](#access-modes)
    - [Typical Workflow](#typical-workflow)

- [Hands-On: Creating Persistent Volumes and Persistent Volume Claims](#hands-on-creating-persistent-volumes-and-persistent-volume-claims)

- [Hands-On: Mounting Volumes in Pods and Containers](#hands-on-mounting-volumes-in-pods-and-containers)

- [Hands-On: Deleting Persistent Volumes and Persistent Volume Claims](#hands-on-deleting-persistent-volumes-and-persistent-volume-claims)

- [Hands-On: Dynamically Provisioning Persistent Volumes](#hands-on-dynamically-provisioning-persistent-volumes)

- [Introduction to StatefulSets](#introduction-to-statefulsets)
    - [Purpose](#purpose)
    - [Key Features](#key-features)
    - [How Persistent Storage Works](#how-persistent-storage-works)
    - [Typical Use Cases](#typical-use-cases)

- [Hands-On: Working with StatefulSets - Creating Persistent Volumes](#hands-on-working-with-statefulsets---creating-persistent-volumes)

- [Hands-On: Working with StatefulSets - Creating the StatefulSet](#hands-on-working-with-statefulsets---creating-the-statefulset)

- [Hands-On: StatefulSets with Dynamically Provisioned Persistent Volumes](#hands-on-statefulsets-with-dynamically-provisioned-persistent-volumes)

# Introduction to Volume

### 1\. **Why Volumes Exist**

- **Containers are ephemeral**: By default, container filesystems are lost when a pod restarts.
    
- **Volumes provide persistence and sharing** of data between containers inside a pod.
    

* * *

### 2\. **How Volumes Work**

- From the **container’s perspective**, a volume is **just a directory** it can read and write to.
    
- The difference between volume types is **where that directory’s data lives** (e.g., memory, local disk, cloud storage) and **how it’s created**.
    

* * *

### 3\. **Pod Specification**

- Define volumes under:
    
    ```yaml
    spec:
      volumes:
        - name: <volume-name>
          <volume-type>: {...}
    ```
    
- Mount them into containers with:
    
    ```yaml
    spec:
      containers:
        - name: <container-name>
          volumeMounts:
            - name: <volume-name>
              mountPath: /path/in/container
    ```
    
- Any external resource (PersistentVolume, ConfigMap, Secret) must **exist first** before referencing it.
    

* * *

### 4\. **Common Volume Types**

| Type | Purpose | Key Notes |
| --- | --- | --- |
| **emptyDir** | Temporary, pod-scoped scratch space | Data gone when the pod stops |
| **hostPath** *(legacy)* | Mounts a directory from the node’s filesystem | Discouraged due to security risks |
| **local** | Node-specific persistent storage | Requires node affinity and a PersistentVolume |
| **PersistentVolume** | Durable storage | Backed by cloud disks, NFS, etc.; can be **statically** or **dynamically** provisioned |
| **ConfigMap** | Inject configuration data into pods, without havind to hard-code the data into the pod definition | Useful for app settings |
| **Secret** | Inject sensitive data | Keeps passwords/keys out of manifests |

* * *

### 5\. **Storage Backends**

- Cloud options: AWS EBS/EFS, GCP Persistent Disk, Azure Disk/File, etc.
    
- On-prem options: NFS, iSCSI, Ceph, custom drivers.
    
- For custom solutions, explore **CSI (Container Storage Interface)** to create your own storage driver.
    

* * *

### 6\. **Lifecycle Notes**

- **emptyDir** follows pod lifecycle.
    
- **local/PersistentVolume** outlive the pod but may depend on node availability unless using a cloud or networked backend.
    

* * *

**Key takeaway:**  
Volumes decouple storage from the container’s short life. Choose the right type (ephemeral vs. persistent, local vs. cloud) and declare both the `volumes` and the `volumeMounts` sections in your pod spec.

# EmptyDir and Local Volumes

* * *

## emptyDir

**Scope & Lifecycle**

- **Pod-level, ephemeral storage.**
    
- Volume is created **when the Pod is scheduled to a node** and deleted **when the Pod is removed**.
    

**Usage**

- Shared scratch space between **containers in the same Pod**.
    
- Containers can mount it at **different paths** inside their filesystems.
    
- Starts out **empty**.
    

**Persistence**

- **Lost when the Pod dies** or is rescheduled elsewhere.
    
- Not suitable for any data you need to keep after the Pod is gone.
    

**Typical Scenarios**

- Temporary files, caching, or intermediary processing results.
    
- Sharing data between multiple containers in one Pod (e.g., sidecar patterns).
    

* * *

## Local Volume

**Scope & Lifecycle**

- **Node-level, persistent relative to the Pod.**
    
- Data remains as long as the **underlying node exists**.
    

**Provisioning**

- Implemented as a **PersistentVolume** of type `local`.
    
- **Static provisioning only:** you must create the PersistentVolume first.
    
- Requires a **PersistentVolumeClaim (PVC)** for Pods to use it.
    

**Scheduling**

- Must specify **node affinity** in the PV so the scheduler places Pods on the node that owns the storage.

**Persistence**

- Survives Pod restarts/rescheduling **on the same node**,  
    but **lost if the node is deleted or replaced**.

**Typical Scenarios**

- High-performance workloads needing fast local disk (e.g., temporary databases, caches).
    
- Data you can afford to lose if a node disappears.
    

* * *

### Quick Decision Guide

| Feature | emptyDir | Local Volume |
| --- | --- | --- |
| **Lifecycle** | Pod | Node |
| **Provisioning** | Automatic with Pod | Manual PV + PVC + Node Affinity |
| **Persistence** | Ends with Pod | Ends with Node |
| **Common Uses** | Ephemeral scratch, shared sidecar storage | Fast local disk where limited loss is acceptable |

* * *

**Production Tip**  
Neither is appropriate for truly **durable, multi-node storage**.  
For that, use cloud or networked backends (EBS, NFS, Ceph, etc.) through PersistentVolumes and CSI drivers.

# Hands-On: Working with EmptyDir Ephemeral Storage

  

### 1\. Concept

- Pod-scoped temporary storage.
    
- Created when the Pod is scheduled to a node and deleted when the Pod is removed.
    
- Data survives container restarts but not Pod deletion.
    

### 2\. Pod Manifest Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: empty-dir-demo
  labels:
    app.kubernetes.io/name: empty-dir-demo
spec:
  containers:
  - name: empty-dir-demo
    image: busybox:latest
    command:
    - 'sh'
    - '-c'
    - 'sleep 3600'
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
    volumeMounts:
    - name: empty-dir-volume
      mountPath: /usr/share/empty-dir
  volumes:
  - name: empty-dir-volume
    emptyDir: {}

```

- `emptyDir: {}` defaults to node disk.
    
- `medium: "Memory"` uses RAM (counts against container memory limits).
    
- `sizeLimit` can enforce a quota.
    

### 3\. Commands

```bash
kubectl apply -f emptydir-demo.yaml
kubectl exec -it emptydir-demo -c writer -- sh
echo "hello" > /usr/share/temp/hello.txt
exit

kubectl exec -it emptydir-demo -c reader -- sh
cat /temp/hello.txt           # Works
echo "fail" > /temp/fail.txt  # Error: read-only file system
exit
```

### 4\. Lifecycle

- Container restart: file remains.
    
- Pod deletion: file is lost.
    

```bash
kubectl delete pod emptydir-demo
kubectl apply -f emptydir-demo.yaml
# Files inside the emptyDir volume are gone
```

### 5\. Use Cases

- Sharing data between multiple containers in one Pod (for example, a writer/reader sidecar pattern).
    
- Temporary caches or scratch space where loss of data is acceptable.
    

This setup is ideal for short-lived, Pod-bound data sharing where persistence beyond the Pod is not required.

* * *

emptyDir Ephemeral Storage – Quick Reference

### 1\. Concept

- Pod-scoped temporary storage.
    
- Created when the Pod is scheduled to a node and deleted when the Pod is removed.
    
- Data survives container restarts but not Pod deletion.
    

### 2\. Pod Manifest Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: emptydir-demo
spec:
  containers:
    - name: writer
      image: busybox:1.36.1
      command: ["sh", "-c", "sleep 3600"]
      volumeMounts:
        - name: temp-storage
          mountPath: /usr/share/temp
    - name: reader
      image: busybox:1.36.1
      command: ["sh", "-c", "sleep 3600"]
      volumeMounts:
        - name: temp-storage
          mountPath: /temp
          readOnly: true
  volumes:
    - name: temp-storage
      emptyDir: {}   # Optional: { medium: "Memory", sizeLimit: "512Mi" }
```

- `emptyDir: {}` defaults to node disk.
    
- `medium: "Memory"` uses RAM (counts against container memory limits).
    
- `sizeLimit` can enforce a quota.
    

### 3\. Commands

```bash
kubectl apply -f emptydir-demo.yaml
kubectl exec -it empty-dir-demo -c empty-dir-writer -- sh

echo "hello" > /usr/share/temp/hello.txt
exit

kubectl exec -it empty-dir-demo -c empty-dir-reader -- sh
cat /temp/hello.txt           # Works
echo "fail" > /temp/fail.txt  # Error: read-only file system
exit
```

### 4\. Lifecycle

- Container restart: file remains.
    
- Pod deletion: file is lost.
    

```bash
kubectl delete pod emptydir-demo
kubectl apply -f emptydir-demo.yaml
# Files inside the emptyDir volume are gone
```

### 5\. Use Cases

- Sharing data between multiple containers in one Pod (for example, a writer/reader sidecar pattern).
    
- Temporary caches or scratch space where loss of data is acceptable.
    

This setup is ideal for short-lived, Pod-bound data sharing where persistence beyond the Pod is not required.

# Introduction to Persistent Volume Claims

## PersistentVolume (PV) and PersistentVolumeClaim (PVC) Overview

### Key Idea

- **PV**: The actual storage resource in the cluster (disk, NFS share, cloud volume, etc.).
    
- **PVC**: A user request for storage. Pods never mount a PV directly—they mount a PVC, and the PVC binds to exactly one PV.
    

* * *

### Binding Rules

- **One-to-one**: A PV can bind to only one PVC at a time.
    
- **Size matters**: If a PV is larger than requested, the unused space is stranded; it cannot be split among other claims.
    

* * *

### Provisioning Types

1.  **Static Provisioning**
    
    - Admin pre-creates PVs.
        
    - PVCs request size and access mode.
        
    - Kubernetes performs a *best-effort* match. If none fits, the claim stays Pending.
        
2.  **Dynamic Provisioning**
    
    - A PVC triggers creation of a PV automatically, using a StorageClass.
        
    - Common in cloud environments.
        
    - Satisfies the requested size and access mode if the storage backend supports it.
        

* * *

### Reclaim Policies (what happens when a PVC is deleted)

- **Retain**: Keep the PV and data. Manual cleanup/repurposing required.
    
- **Delete** (default for most dynamic backends): Remove the underlying storage and PV object.
    
- **Recycle**: Legacy, deprecated.
    

* * *

### Access Modes

- **ReadWriteOnce (RWO)**: Read/write by a single *node* (multiple Pods on that node can share it).
    
- **ReadOnlyMany (ROX)**: Read-only by multiple nodes.
    
- **ReadWriteMany (RWX)**: Read/write by multiple nodes.
    
- **ReadWriteOncePod (RWOP)**: Read/write by a single Pod (strongest restriction).
    

* * *

### Key Takeaways

- Pods always mount PVCs, never PVs directly.
    
- Dynamic provisioning simplifies management; static gives more control but can waste space.
    
- Reclaim policy determines what happens to data when a claim is deleted.
    
- Access modes define node/pod sharing constraints.
    

This foundation will make working with **local volumes** (which require PVCs) straightforward.

&nbsp;

# Hands-On: Creating Persistent Volumes and Persistent Volume Claims

## YAML Highlights

**PersistentVolume example (`local-volume.yaml`):**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: local-volume
spec:
  capacity:
    storage: 0.5Gi
  volumeMode: Filesystem
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: local-storage
  local:
    path: /mnt/disks/local1
  nodeAffinity:
    required:
      nodeSelectorTerms:
        - matchExpressions:
            - key: kubernetes.io/hostname
              operator: In
              values: ['minikube']
  



```

Key points:

- `local.path` **must exist** inside the node before it can be used.
    
- `nodeAffinity` keeps scheduling tied to the correct node.
    

* * *

**PersistentVolumeClaim example (`local-volume-claim.yaml`):**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: local-volume-claim
spec:
  resources:
    requests:
      storage: 0.1Gi
  accessModes:
    - ReadWriteOnce
  storageClassName: local-storage
  volumeName: local-volume
  volumeMode: Filesystem
```

*If you request more (e.g., `2Gi`) than the PV provides, the PVC stays **Pending**.*

* * *

## Common Errors & Gotchas

- **Pending PVC** – Happens if:
    
    - No PV matches requested size/mode/class.
        
    - Or the directory (`/mnt/disks/local1`) doesn’t exist yet.
        
- &nbsp;Kubernetes may say “storage class not found” even when the real issue is simply a size mismatch.
    

* * *

### Key Takeaway

Persistent Volumes are cluster resources.  
Persistent Volume Claims are the user’s way of requesting them.  
When working with **local volumes**, ensure:

- The directory exists on the node.
    
- Node affinity is correct.
    
- PVC requests match PV capacity and storage class.
    

&nbsp;

# Hands-On: Mounting Volumes in Pods and Containers

* * *

## 1\. Goal

Demonstrate how to **use a PersistentVolume (PV) and PersistentVolumeClaim (PVC) in a Pod**, proving that data stored in a local PV survives Pod deletion and can be shared across Pods.

* * *

## 2\. Pod Definition Highlights

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: local-vol-pod
spec:
  containers:
  - name: local-vol
    image: busybox:latest
    command:
    - 'sh'
    - '-c'
    - 'sleep 3600'
    resources:
      requests:
        memory: "64Mi"
        cpu: "250m"
      limits:
        memory: "128Mi"
        cpu: "500m"
    volumeMounts:
    - name: local-vol-storage
      mountPath: /mnt/disks/local1
  volumes:
    - name: local-vol-storage
      persistentVolumeClaim:
        claimName: local-volume-claim

```

*Same structure as an `emptyDir` volume, but `persistentVolumeClaim` replaces `emptyDir`.*

* * *

## 3\. Setup & Troubleshooting

1.  **Path must exist on the node**  
    *Local PV points to `/mnt/disks/local1` on the node.*  
    Create it:
    
    ```bash
    minikube ssh
    sudo mkdir -p /mnt/disks/local1
    sudo chmod 777 /mnt/disks/local1
    ```
    
2.  **Initial error**  
    *If the directory doesn’t exist*, Pod stays in `ContainerCreating` with a **FailedMount** warning.
    
3.  **After creating the path**, re-applying the Pod works; PV/PVC don’t need to be recreated.
    

* * *

## 4\. Verifying Persistent Data

- Exec into the running Pod:
    
    ```bash
    kubectl exec -it local-vol-pod -- sh
    echo "hello from pod" > /mnt/disks/local1/hello.txt
    
    ```
    
- Confirm the file exists on the **node**:
    
    ```bash
    minikube ssh
    cat /mnt/disks/local1/hello.txt
    ```
    
- Delete and recreate the Pod → the file is **still present**, proving storage is independent of Pod lifecycle.
    

* * *

## 5\. Sharing Between Pods

- Create a second Pod mounting the **same PVC** (possibly at a different container path, e.g. `/mnt/local2`).
    
- Both Pods see the same `hello.txt` file.
    

* * *

### **Takeaways**

- **PersistentVolume + PersistentVolumeClaim decouple storage from Pods.**
    
- Data persists through Pod deletion/recreation and can be accessed by multiple Pods.
    
- For local PVs, the host-path directory **must pre-exist** and Node Affinity ensures scheduling to the correct node.

# Hands-On: Deleting Persistent Volumes and Persistent Volume Claims

## 1\. Resources Deleted in Sequence

- **Pods → PVC → PV**  
    *Delete the Pods first, then the PersistentVolumeClaim (PVC), and finally the PersistentVolume (PV).*

* * *

## 2\. Retain Reclaim Policy Behavior

- The PV was created with **`persistentVolumeReclaimPolicy: Retain`** (default for manually created PVs).
    
- After deleting the PVC:
    
    - PV status changes to **`Released`**.
        
    - **Released ≠ Reusable** – Kubernetes will **not** automatically bind a new claim to it, even if the specs match.
        
    - Manual admin action is required to clean and reuse it.
        

* * *

## 3\. Data Persistence

- Deleting the PVC **does not** delete the underlying data.
    
- Deleting the PV **also does not** delete the host-path data when using a **local volume**.
    
- Verifying via `minikube ssh` shows that the `/mnt/disks/local1/hello.txt` file remains.
    

* * *

## 4\. Dynamic Provisioning Contrast

- Dynamically provisioned PVs (e.g., AWS EBS/EFS) typically default to **`Delete`** reclaim policy.
    
- With `Delete`, underlying cloud storage *can* be automatically removed, depending on the storage class configuration.
    

* * *

## 5\. Key Takeaways

- **Retain policy keeps data safe**: underlying files persist even after PV/PVC deletion.
    
- A PV in `Released` state requires **manual cleanup** to be used again.
    
- Local volumes are ideal for development and testing persistent storage, but **data management is your responsibility**.
    

This wraps up the local volume lifecycle:  
Pods can be removed and re-created, PVCs can be dropped, PVs can be deleted—but the **host-node files remain** until you manually clean them up.

# Hands-On: Dynamically Provisioning Persistent Volumes

* * *

## 1\. Minikube’s Default StorageClass

- Command: `kubectl get storageclass`
    
- Minikube provides a default StorageClass named `standard`.
    
- Provisioner: `k8s.io/minikube-hostpath` (hostPath-backed dynamic storage).
    
- Annotation: `storageclass.kubernetes.io/is-default-class: true`  
    This means any PersistentVolumeClaim (PVC) that does not specify a `storageClassName` will automatically use this class.
    

* * *

## 2\. Creating a Dynamic PVC

- Create a PVC without specifying `storageClassName`, or set `storageClassName: standard`.
    
- Kubernetes automatically:
    
    - Creates a PersistentVolume (PV) behind the scenes.
        
    - Binds the PV to the PVC immediately, so it never sits in a Pending state.
        
- Data is stored on the Minikube node under a path such as  
    `/tmp/hostpath-provisioner/default/<random-id>/`.
    

```
marcos@G15:~/Git/Kubernetes-Testes/9 - Storage$ kubectl describe pv pvc-6d2755e0-8811-4537-87ea-d844ad18df93
Name:            pvc-6d2755e0-8811-4537-87ea-d844ad18df93
Labels:          <none>
Annotations:     hostPathProvisionerIdentity: 448b0534-b52a-4ceb-ab1b-5b519099face
                 pv.kubernetes.io/provisioned-by: k8s.io/minikube-hostpath
Finalizers:      [kubernetes.io/pv-protection]
StorageClass:    standard
Status:          Bound
Claim:           default/dynamic-pvc
Reclaim Policy:  Delete
Access Modes:    RWO
VolumeMode:      Filesystem
Capacity:        1Gi
Node Affinity:   <none>
Message:         
Source:
    Type:          HostPath (bare host directory volume)
    Path:          /tmp/hostpath-provisioner/default/dynamic-pvc
    HostPathType:  
Events:            <none>

```

* * *

## 3\. Reclaim Policy: Delete

- Dynamic PVs default to `persistentVolumeReclaimPolicy: Delete`.
    
- Deleting the PVC deletes both the PV and the underlying directory with its data.
    

* * *

## 4\. Changing the Policy

- To retain data for dynamic PVs, edit the StorageClass and set:
    
    ```yaml
    reclaimPolicy: Retain
    ```
    
- Any PVC created afterward using that StorageClass will keep its data even after deletion.
    

* * *

## 5\. Deletion Order

- You cannot delete a PV while its PVC still exists.
    
- Delete the PVC first. Kubernetes then removes the PV automatically.
    

* * *

## 6\. Key Points

- Dynamic provisioning removes the need to manually create host directories or PV manifests.
    
- In production, you would typically use a cloud or CSI-based provisioner (for example, AWS EBS, GCP PD) instead of Minikube’s hostPath driver.
    
- Choose the reclaim policy carefully (`Delete` versus `Retain`) based on how critical the data is.

# Introduction to StatefulSets

## Purpose

StatefulSets manage **stateful applications** where each pod needs:

- A **stable network identity** (predictable DNS name).
    
- A **persistent storage volume** that survives pod restarts.
    

* * *

## Key Features

### 1\. Stable Pod Identity

- Each pod receives a **unique, predictable name**:  
    `<statefulset-name>-0`, `<statefulset-name>-1`, and so on.
    
- The name and associated DNS record stay the same across restarts.
    

### 2\. Stable Storage

- Each replica automatically gets its **own PersistentVolumeClaim (PVC)**.
    
- On restart, the pod is reattached to **its same PVC and PersistentVolume (PV)**.
    
- Volumes are **not shared** among replicas.
    
- PVCs and PVs are **not deleted automatically** when a pod is deleted.
    

### 3\. Ordered Operations

- **Creation and scaling up**: pods start **one at a time**, in order (0, 1, 2…).
    
- **Scaling down or deletion**: pods are removed in reverse order (highest index first).
    
- Useful for systems requiring controlled startup/shutdown (e.g., databases, leader–follower clusters).
    

### 4\. Headless Service Integration

- Typically combined with a **headless Service** (`clusterIP: None`) to provide **stable DNS hostnames** that map directly to the individual pods.

* * *

## How Persistent Storage Works

- StatefulSet manifests often include a **`volumeClaimTemplates`** section.
    
- Kubernetes automatically:
    
    - Creates a separate PVC for each replica.
        
    - Binds each PVC to a PV (statically or dynamically provisioned).
        
- Restarting a pod reattaches the same PVC and PV, preserving data.
    

* * *

## Typical Use Cases

- Databases (MySQL, PostgreSQL, MongoDB, etc.).
    
- Distributed systems requiring consistent network IDs (Kafka, Zookeeper).
    
- Any workload where each pod must maintain its own state.
    

&nbsp;


**Summary:**  
StatefulSets ensure that each pod has a permanent identity and persistent data store, with predictable startup and shutdown order. This makes them the standard Kubernetes controller for stateful workloads.

# Hands-On: Working with StatefulSets - Creating Persistent Volumes

* * *

## 1\. Why StatefulSets

- **Stable pod names and DNS**: each pod gets a predictable name (`<statefulset-name>-0`, `…-1`) and a stable DNS entry when combined with a **headless service**.
    
- **Stable storage**: each pod is re-attached to the same **PersistentVolumeClaim (PVC)** and **PersistentVolume (PV)** across restarts or re-scheduling.
    

* * *

## 2\. Preparing Node Storage

- SSH into Minikube and create host-level directories for local PVs:
    
    ```
    sudo mkdir -p /mnt/disks/ss-0 /mnt/disks/ss-1 /mnt/disks/ss-2
    sudo chmod 777 /mnt/disks/ss*
    ```
    
- Each directory can be used as the backing path for a different PV.
    

* * *

## 3\. Creating PersistentVolumes

- Define a YAML manifest (`pvs.yaml`) with three PV objects.
    
- Key fields in each PV:
    
    - **name**: `statefulset-0`, `statefulset-1`, `statefulset-2`
        
    - **capacity**: for example `storage: 1Gi` (or smaller if desired)
        
    - **accessModes**: usually `ReadWriteOnce`
        
    - **local.path**: `/mnt/disks/ss0` (and so on)
        
    - **nodeAffinity**: restricts the PV to the Minikube node
        
- Apply the file:
    
    ```
    kubectl apply -f pvs.yaml
    ```
    
- Verify:
    
    ```
    kubectl get pv
    ```
    
    All three should show `STATUS: Available` until they are bound to PVCs.
    

* * *

## 4\. Important Notes

- **Binding order is not guaranteed**  
    Kubernetes will match PVCs to any compatible PV. The StatefulSet guarantees **pod creation order**, not which PV each pod will claim.
    
- **Deletion**  
    By default, PVs are not deleted when a StatefulSet pod or PVC is removed; you must clean them up manually (or adjust reclaim policy).
    

* * *

## 5\. Next Steps

You now have the backing storage ready.  
The next logical tasks will be:

1.  Create a **StatefulSet manifest** that includes a `volumeClaimTemplates` section referencing the PVs.
    
2.  Optionally create a **headless Service** (`clusterIP: None`) to expose stable DNS names like:
    
    ```
    <pod-name>.<service-name>.<namespace>.svc.cluster.local
    ```
    

This sets the stage for running a true stateful workload where each replica keeps its own data even if the pod restarts.
# Hands-On: Working with StatefulSets - Creating the StatefulSet

* * *

## 1\. Why Use a StatefulSet

A **StatefulSet** runs pods that need:

- **Stable network IDs** (predictable names/DNS).
    
- **Persistent storage** that stays attached across pod restarts.
    
- **Ordered scaling**—pods start and stop one at a time, in sequence.
    

* * *

## 2\. Preparing the Node (Minikube Demo)

```bash
minikube ssh
sudo mkdir -p /mnt/disks/ss0 /mnt/disks/ss1 /mnt/disks/ss2
sudo chmod 777 /mnt/disks/ss*
exit
```

These directories serve as local storage backends for static PersistentVolumes (PVs).

* * *

Apply:

```bash
kubectl apply -f pvs.yaml
```

* * *

```bash
kubectl apply -f stateful-set.yaml
```

* * *

## 5\. Verify the Setup

```bash
kubectl get pods                 # demo-statefulset-0, demo-statefulset-1
kubectl get pvc                  # demo-statefulset-0/local-storage ...
kubectl get pv                   # ss0, ss1 bound; ss2 remains available
```

*Pods are named predictably (`-0`, `-1`) and created one after the other.*

* * *

## 6\. Test Persistence

Write a file inside pod 0:

```bash
kubectl exec -it demo-satateful-set-0 -- sh

echo "hello from pod0" > /mnt/local/hello.txt
exit
```

Delete the pod:

```bash
kubectl delete pod demo-satateful-set-0
```

After it restarts, check again:

```bash
kubectl exec -it demo-satateful-set-0 -- cat /mnt/local/hello.txt
# Output: hello from pod0
```

The file is still present because the pod reattaches to the same PVC and PV.

Pods don't share the same PV

```
kubectl exec -it demo-satateful-set-1 -- cat /mnt/local/hello.txt
cat: can't open '/mnt/local/hello.txt': No such file or directory

```

## 7\. Key Points to Remember

- **VolumeClaimTemplates** let Kubernetes create a separate PVC per replica automatically.
    
- Pod names and DNS entries stay consistent, enabling direct communication (e.g., `demo-statefulset-0.busybox.default.svc.cluster.local`).
    
- Pods scale up/down **in order** (0 → 1 … up, highest index first down).
    
- Deleting a pod **does not delete its PVC or PV**, so data persists.
    

* * *

This configuration demonstrates the core strength of StatefulSets: **stable identity plus reliable persistent storage** for each replica, which ordinary Deployments cannot provide.

# Hands-On: StatefulSets with Dynamically Provisioned Persistent Volumes

* * *

## 1\. Background

- **Static provisioning**:  
    You manually create host directories on the Minikube node, define `PersistentVolume` (PV) objects, and bind them to claims.
    
- **Dynamic provisioning**:  
    Kubernetes automatically creates the PVs when a `PersistentVolumeClaim` (PVC) requests storage through a **StorageClass** (e.g. `standard`).
    

* * *

## 2\. Update the StatefulSet YAML

Open the StatefulSet manifest you used earlier and change only the **volumeClaimTemplates** section.

**Before (static):**

```yaml
volumeClaimTemplates:
- metadata:
    name: local-storage
  spec:
    accessModes: [ReadWriteOnce]
    storageClassName: local-storage   # static PVs
    resources:
      requests:
        storage: 128Mi
```

**After (dynamic):**

```yaml
volumeClaimTemplates:
- metadata:
    name: local-storage
  spec:
    accessModes: [ReadWriteOnce]
    storageClassName: standard        # dynamic provisioning
    resources:
      requests:
        storage: 128Mi
```

*Keep the `storageClassName` explicit to avoid surprises if the cluster’s default storage class changes.*

* * *

## 3\. Apply the New Definition

```bash
kubectl apply -f stateful-set.yaml
```

- Kubernetes creates two replicas (if `replicas: 2` is set).
    
- For each pod, a PVC is generated and immediately bound to a dynamically created PV.
    

Check resources:

```bash
kubectl get pvc
kubectl get pv
```

You’ll see:

- PVCs named `local-storage-demo-statefulset-0`, `local-storage-demo-statefulset-1`
    
- PVs automatically created and **bound**.
    

* * *

## 4\. Verify on Minikube

If using the default host-path provisioner:

```bash
minikube ssh
ls /tmp/hostpath-provisioner/default/
```

Two directories (one per PV) should exist.

* * *

## 5\. Deleting the StatefulSet

```bash
kubectl delete statefulset demo-statefulset
```

- PVCs and PVs **remain**.
    
- This preserves data for stateful workloads.
    

Check:

```bash
kubectl get pvc
kubectl get pv
```

* * *

## 6\. Cleaning Up Manually

If you truly want to remove the storage:

```bash
kubectl delete pvc --all
kubectl delete pv  --all
```

Because the `standard` storage class has a **Delete** reclaim policy, PVs are removed automatically when their PVCs are deleted.

* * *

## Key Takeaways

- Migrating from static to dynamic provisioning requires **only changing the `storageClassName`** (and removing any manual PV definitions).
    
- StatefulSets keep PVCs and PVs even after the workload is deleted, ensuring data durability.
    
- Dynamic provisioning simplifies storage management—no manual SSH or PV YAML needed.

