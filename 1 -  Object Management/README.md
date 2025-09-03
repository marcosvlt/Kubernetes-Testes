# Index

1. [Managing Objects in Kubernetes](#managing-objects-in-kubernetes)
    - [Imperative Management with kubectl](#1-imperative-management-with-kubectl)
    - [Imperative Management with Configuration Files](#2-imperative-management-with-configuration-files)
    - [Declarative Management with Configuration Files](#3-declarative-management-with-configuration-files)
    - [Common Across All Methods](#common-across-all-methods)
    - [Summary](#summary)

2. [Kubernetes Manifests (Configuration Files)](#kubernetes-manifests-configuration-files)
    - [What is a Manifest?](#what-is-a-manifest)
    - [`apiVersion`](#1-apiversion)
    - [`kind`](#2-kind)
    - [`metadata`](#3-metadata)
    - [`spec`](#4-spec)
    - [Example Pod Manifest](#example-pod-manifest)
    - [Key Takeaways](#key-takeaways)

3. [Managing Kubernetes Objects with Configuration Files](#managing-kubernetes-objects-with-configuration-files)
    - [Imperative vs Declarative Management](#1-imperative-vs-declarative-management)
    - [Example: Pod Manifest File](#2-example-pod-manifest-file-nginx-podyaml)
    - [Creating the Pod from Manifest](#3-creating-the-pod-from-manifest)
    - [Notes](#4-notes)

4. [Managing Kubernetes Services with Configuration Files](#managing-kubernetes-services-with-configuration-files)
    - [Goal](#1-goal)
    - [Service Manifest](#2-service-manifest-nginx-svcyaml)
    - [Create and Test the Service](#3-create-and-test-the-service)
    - [Verification with Test Pod](#4-verification-with-test-pod)
    - [Behavior on Pod Deletion](#5-behavior-on-pod-deletion)
    - [Key Takeaways](#6-key-takeaways)

5. [Generating Configuration Files from Imperative Commands](#generating-configuration-files-from-imperative-commands)
    - [Why Use This Approach?](#1-why-use-this-approach)
    - [Example: Generating a Pod Manifest](#2-example-generating-a-pod-manifest)
    - [Example: Generating a Service Manifest](#3-example-generating-a-service-manifest)
    - [Key Points](#4-key-points)

6. [Limitations of Imperative Style](#limitations-of-imperative-style)
    - [Difference Between Written Config vs. Live Config](#1-difference-between-written-config-vs-live-config)
    - [The Replace Problem](#2-the-replace-problem)
    - [Workaround in Imperative Style](#3-workaround-in-imperative-style)
    - [Advantage of Declarative Style](#4-advantage-of-declarative-style)
    - [Deleting Multiple Objects](#5-deleting-multiple-objects)
    - [Key Takeaway](#key-takeaway)

7. [Declarative Management with `kubectl apply`](#declarative-management-with-kubectl-apply)
    - [Core Declarative Commands](#1-core-declarative-commands)
    - [Managing Multiple Objects](#2-managing-multiple-objects)
    - [Previewing Changes with `diff`](#3-previewing-changes-with-diff)
    - [How Updates Work Internally](#4-how-updates-work-internally)
    - [Last Applied Configuration](#5-last-applied-configuration)
    - [Why Declarative > Imperative](#6-why-declarative--imperative)

8. [Migrating from Imperative to Declarative with `kubectl apply`](#migrating-from-imperative-to-declarative-with-kubectl-apply)
    - [Starting Point](#1-starting-point)
    - [Switching to Declarative Management](#2-switching-to-declarative-management)
    - [Saving the Last Applied Config Explicitly](#3-saving-the-last-applied-config-explicitly)
    - [After First Apply](#4-after-first-apply)
    - [Key Insight](#5-key-insight)
    - [Takeaway](#takeaway)

9. [Managing Multiple Kubernetes Objects in One or Multiple Files](#managing-multiple-kubernetes-objects-in-one-or-multiple-files)
    - [Defining Multiple Objects in a Single File](#1-defining-multiple-objects-in-a-single-file)
    - [Behavior with `apply` vs. `create`](#2-behavior-with-apply-vs-create)
    - [Alternatives for Organization](#3-alternatives-for-organization)
    - [Trade-offs](#4-trade-offs)
    - [Key Takeaway](#5-key-takeaway)
# Managing Objects in Kubernetes

There are **three main ways** to manage Kubernetes objects:

1.  **Imperative Management with kubectl**
    
2.  **Imperative Management with Configuration Files**
    
3.  **Declarative Management with Configuration Files**
    

* * *

## 1. Imperative Management with kubectl

- **Description**:  
    Directly run `kubectl` commands to create, modify, or delete resources.
    
- **Pros**:
    
    - Lowest learning curve.
        
    - Transparent commands (e.g., `create`, `delete`, `expose`).
        
    - Fast and straightforward (single step, no files needed).
        
- **Cons**:
    
    - No reusable templates.
        
    - No change review or audit trail.
        
    - No historical record of deleted/modified objects.
        
    - Hard to reproduce complex objects.
        

* * *

## 2. Imperative Management with Configuration Files

- **Description**:  
    Write object definitions in YAML/JSON files, then run commands like:
    
    ```bash
    kubectl create -f file.yaml
    kubectl delete -f file.yaml
    kubectl replace -f file.yaml
    ```
    
- **Pros**:
    
    - Config files can be **versioned, reviewed, audited**.
        
    - Provide **templates** for object creation.
        
    - Easier than declarative (explicitly tells Kubernetes what to do).
        
    - Good for single files or small sets of files.
        
- **Cons**:
    
    - Less suitable for large sets of files (directories).
        
    - Requires familiarity with object schemas (Pods, Services, Deployments).
        
    - Updates made outside the config files are **not persisted** (can cause issues with 3rd-party systems).
        

* * *

## 3. Declarative Management with Configuration Files

- **Description**:  
    Use `kubectl apply` to apply a file or directory.  
    Kubernetes decides what needs to change to match the desired state.
    
    ```bash
    kubectl apply -f file.yaml
    kubectl diff -f filename.yaml
    kubectl delete -f filename.yaml
    ```
    
- **Pros**:
    
    - Supports **persisting external updates** (annotations, labels, etc.).
        
    - Automatically figures out **differences** and applies updates.
        
    - Scales well for **large projects** with multiple files.
        
    - Preferred in **real-world production environments**.
        
- **Cons**:
    
    - **Higher learning curve** (most complex method).
        
    - Debugging partial updates can be tricky.
        
    - Config files may not always reflect full live object state.
        
    - Requires discipline in managing updates.
        

* * *

## Common Across All Methods

- Commands like `kubectl get`, `kubectl describe`, `kubectl logs` remain the same to query and inspect resources.
    
- Complexity grows as you move from **imperative kubectl → imperative files → declarative files**.
    

* * *

## Summary

- **Imperative kubectl**: Quick, easy, but not reusable.
    
- **Imperative with config files**: Reusable, versionable, better for small sets of files.
    
- **Declarative with config files**: Scalable, production-grade, but more complex.
    

👉 In real-world projects, **imperative with config files** and **declarative management** are used almost exclusively.

# Kubernetes Manifests (Configuration Files)

## What is a Manifest?

- A **manifest** (or configuration file) defines the **desired state** of a Kubernetes object.
    
- Written in **YAML syntax**.
    
- Basis for **imperative (with files)** and **declarative** object management.
    
- Typically contains **four top-level fields** (may vary depending on object type).
    

* * *

## 1. `apiVersion`

- Defines the **API group** and its version.
    
- Example values:
    
    - `v1` → core group.
        
    - `apps/v1` → apps group.
        
    - `something/v1beta1` → beta APIs.
        
- The `kind` chosen must be supported by this API version.
    

* * *

## 2. `kind`

- Defines the **type of Kubernetes object** being created.
    
- Examples: `Pod`, `Deployment`, `Service`, `Namespace`.
    
- Must match the supported resources of the specified `apiVersion`.
    

* * *

## 3. `metadata`

- **Identifying information** about the object:
    
    - `name` → unique object name.
        
    - `namespace` → namespace scope.
        
    - `labels` → key/value pairs for organization & selection.
        
    - `annotations` → non-identifying metadata, often used for configs or behavior hints.
        
- **System fields** may also be added/modified by Kubernetes for internal management.
    

* * *

## 4. `spec`

- Defines the **desired state and configuration** of the object.
    
- The required fields in `spec` depend on both:
    
    - The **apiVersion**.
        
    - The **kind** of object.
        
- Examples:
    
    - For a **Pod**: `spec` must include `containers`.
        
    - For a **Deployment**: `spec` must include `replicas`, `selector`, and `template`.
        
- Not all fields are mandatory; some vary by object type.
    
- Documentation (and IDE tooling) helps identify required vs. optional fields.
    

* * *

## Example Pod Manifest

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
    - name: nginx-container
      image: nginx:latest
      ports:
        - containerPort: 80
```

* * *

## Key Takeaways

- A manifest describes **what you want**, Kubernetes makes it **happen**.
    
- Top-level fields = `apiVersion`, `kind`, `metadata`, `spec`.
    
- `spec` changes depending on the object type and API version.
    
- You don’t need to memorize everything — rely on **documentation** and **IDE support**.
    
- By the end of practice, manifests will become **second nature** in Kubernetes work.
    

&nbsp;

# Managing Kubernetes Objects with Configuration Files

## 1. Imperative vs Declarative Management

- **Imperative with kubectl**
    
    - Direct commands to create and manage objects.
        
    - Examples:
        
        ```bash
        kubectl run nginx-pod --image=nginx:1.27.0
        kubectl delete pod nginx-pod
        kubectl expose pod nginx-pod --port=80 --target-port=80
        ```
        
- **Declarative with manifests**
    
    - Define the desired state in a YAML file.
        
    - Use `kubectl create -f file.yaml` or `kubectl apply -f file.yaml`.
        

* * *

## 2. Example: Pod Manifest File (`nginx-pod.yaml`)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
    - name: nginx-container
      image: nginx:1.27.0
      ports:
        - containerPort: 80
```

### Key Fields

- **apiVersion**: API group + version (`v1` for core objects).
    
- **kind**: Resource type (`Pod`).
    
- **metadata**: Identifiers (name, namespace, labels, optional annotations).
    
- **spec**: Configuration of the resource (e.g., containers, ports, limits).
    

* * *

## 3. Creating the Pod from Manifest

```bash
kubectl create -f nginx-pod.yaml
```

- Verify pod creation:
    
    ```bash
    kubectl get pods
    kubectl describe pod nginx-pod
    ```
    
- Check:
    
    - Labels are present.
        
    - Container is running with the defined image.
        
    - Container is listening on port 80.
        

* * *

## 4. Notes

- Resource limits (CPU, memory) are recommended but not mandatory.
    
- Annotations can be added under `metadata` for descriptive or configuration purposes.
    
- IDE extensions (like VSCode Kubernetes plugin) provide **autocomplete, schema validation, and documentation** while writing manifests.
    

* * *

# Managing Kubernetes Services with Configuration Files

## 1. Goal

Recreate, via a configuration file, the **NodePort Service** we previously created imperatively with:

```bash
kubectl expose pod nginx-pod --type=NodePort --port=80 --target-port=80
```

* * *

## 2. Service Manifest (`nginx-svc.yaml`)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-svc
  labels:
    app: nginx
  annotations:
    description: "This is an nginx service for learning"
    version: "1.0"
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: NodePort


```

### Key Sections

- **apiVersion**: `v1` for Service resources.
    
- **kind**: `Service`.
    
- **metadata**: Identifiers (`name`, `labels`).
    
- **spec**:
    
    - **type**: `NodePort` → makes the service accessible on each node’s IP at a static port.
        
    - **ports**:
        
        - `port`: Port exposed by the Service.
            
        - `targetPort`: Port on the pod receiving traffic.
            
        - `protocol`: Default is `TCP`.
            
    - **selector**: Routes requests to pods with `app: nginx` label.
        

* * *

## 3. Create and Test the Service

```bash
kubectl create -f nginx-svc.yaml
kubectl get svc
```

- Output will show the **ClusterIP** (internal) and the **NodePort** (external).
    
- Traffic sent to the service will be routed to any pod with `app: nginx`.
    

* * *

## 4. Verification with Test Pod

1.  Start an Alpine pod for testing:
    
    ```bash
    kubectl run alpine --image=alpine:3.20 -it sh
    ```
    
2.  Inside the pod, install curl:
    
    ```bash
    apk update && apk add curl
    ```
    
3.  Test service connectivity (replace `<CLUSTER-IP>`):
    
    ```bash
    curl http://<CLUSTER-IP>:80
    ```
    

* * *

## 5. Behavior on Pod Deletion

- If the `nginx-pod` is deleted:
    
    - The **Service still exists**, but has no backend → requests fail.
- If the pod is recreated with the same label:
    
    - The service automatically resumes routing traffic.

* * *

## 6. Key Takeaways

- **Services decouple clients from pods** — clients don’t talk to pods directly, but to Services.
    
- **Labels + selectors** define which pods receive traffic.
    
- **NodePort Services** are one way to expose workloads externally, though usually replaced by **Ingress** or **LoadBalancer** in production.
    

* * *

&nbsp;

# Generating Configuration Files from Imperative Commands

## 1. Why Use This Approach?

- Sometimes we don’t know exactly how a **Kubernetes manifest** should look.
    
- Instead of writing it from scratch, we can let `kubectl` generate it for us.
    
- Using the **`--dry-run=client -o yaml`** flags, we can:
    
    - Run the command **locally** (no request sent to the API server).
        
    - Output the equivalent manifest as YAML.
        
    - Save and reuse it as a config file.
        

* * *

## 2. Example: Generating a Pod Manifest

Imperative command:

```bash
kubectl run color-api \
  --image=
  marcos1503/color-api:1.0.0 \
  --dry-run=client -o yaml
```

- `--dry-run=client`: Validates and builds the object **without sending to the cluster**.
    
- `-o yaml`: Outputs the manifest in YAML format.
    

Output (simplified):

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: color-api
  name: color-api
spec:
  containers:
  - image: marcos1503/color-api:1.0.0
    name: color-api
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
```

You can now **save this as `color-api-pod.yaml`** and create it with:

```bash
kubectl create -f color-api-pod.yaml
```

* * *

## 3. Example: Generating a Service Manifest

Imperative command:

```bash
kubectl expose pod nginx-pod \
  --type=NodePort \
  --port=80 \
  --dry-run=client -o yaml
```

Output (simplified):

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    run: nginx-pod
  name: nginx-pod
spec:
  ports:
  - port: 80
    protocol: TCP
    targetPort: 80
  selector:
    run: nginx-pod
  type: NodePort
status:
  loadBalancer: {}
```

* * *

## 4. Key Points

- **Faster learning curve**: lets you inspect the “real” YAML that `kubectl` would create.
    
- **Migration path**: easy way to transition from **imperative** style to **declarative** style.
    
- **Best practice**: always review and adjust generated YAML to fit your application needs.
    

* * *

✅ This technique is especially helpful when learning or when you need to bootstrap manifests quickly.

* * *

&nbsp;

# Limitations of Imperative Style (Even with Config Files)

## 1. Difference Between Written Config vs. Live Config

- The YAML file we write is only a **developer-side definition**.
    
- Kubernetes stores its own **augmented version** of the config:
    
    - Adds fields like:
        
        - `creationTimestamp`, `uid`, `resourceVersion`
            
        - `namespace`
            
        - `imagePullPolicy`
            
        - `volumeMounts`, `serviceAccountName`, `nodeName`
            
- What we write ≠ what Kubernetes actually manages.
    

* * *

## 2. The Replace Problem

- Example: changing an image in the pod (`nginx:1.27.0` → `nginx:alpine`).
    
- Using:
    
    ```bash
    kubectl replace -f nginx-pod.yaml
    ```
    
    leads to an **error**:
    
    ```
    The Pod "nginx" is invalid: spec: Forbidden: 
    pod updates may not change fields other than spec.containers[*].image
    ```
    
- Why?
    
    - The `replace` command tries to overwrite the **entire object** with our file.
        
    - Missing fields (e.g., `volumes`, `volumeMounts`, `serviceAccountName`) get set to `null`.
        
    - Kubernetes rejects the update.
        

* * *

## 3. Workaround in Imperative Style

- Must **delete and recreate** the pod:
    
    ```bash
    kubectl delete -f nginx-pod.yaml
    kubectl create -f nginx-pod.yaml
    ```
    
- This works, but is inefficient and disruptive.
    

* * *

## 4. Advantage of Declarative Style

- With declarative management:
    
    - Kubernetes compares **desired vs. live state**.
        
    - Applies **only the necessary change** (e.g., just updating the container image).
        
    - No need to delete/recreate objects.
        

* * *

## 5. Deleting Multiple Objects

- Imperative deletion can still be convenient:
    
    ```bash
    kubectl delete -f nginx-pod.yaml -f nginx-service.yaml
    ```
    
- Allows deleting multiple resources in a single command.
    

* * *

# Key Takeaway

- **Imperative style** (with `create`/`replace`) struggles when live configs diverge from written configs.
    
- It often forces you to **delete and recreate** resources.
    
- **Declarative style** (`kubectl apply`) is smarter: it detects and applies only the actual changes needed.
    

* * *

&nbsp;

# Declarative Management with `kubectl apply`

## 1. Core Declarative Commands

- **Apply**: creates or updates resources from files or directories.
    
    ```bash
    kubectl apply -f nginx-pod.yaml
    kubectl apply -f .
    ```
    
    - If the object doesn’t exist → Kubernetes creates it.
        
    - If it exists → Kubernetes updates it.
        
- **Delete**: still uses the imperative style.
    
    ```bash
    kubectl delete -f nginx-pod.yaml
    kubectl delete -f object-management/
    ```
    

* * *

## 2. Managing Multiple Objects

- You can apply/delete **an entire directory**:
    
    ```bash
    kubectl apply -f dir/
    kubectl delete -f dir/
    ```
    
- This applies/deletes **all YAML files** inside.
    
- Convenient, but riskier → may apply changes you didn’t intend.
    

* * *

## 3. Previewing Changes with `diff`

- Show what would change before applying:
    
    ```bash
    kubectl diff -f object-management/
    ```
    
- Example: after changing the pod image from `nginx:1.27.0` → `nginx:1.27.0-alpine`
    
    - `diff` shows **only the image field** will be updated.
        
    - Contrast: `replace` failed before, because it attempted to overwrite all fields.
        

* * *

## 4. How Updates Work Internally

- `kubectl apply` doesn’t delete/recreate the pod.
    
- Instead:
    
    - Terminates the old container.
        
    - Starts a new container with the updated image.
        
    - Pod metadata (age, UID) remains the same.
        
- Verified via:
    
    ```bash
    kubectl describe pod nginx-pod
    ```
    
    - `Last State` shows the old container was terminated.
        
    - `Events` log shows both the old and new image pulls.
        

* * *

## 5. Last Applied Configuration

- Declarative style stores the **last applied config** in an annotation:
    
    ```yaml
    annotations:
      kubectl.kubernetes.io/last-applied-configuration: {...}
    ```
    
- Exact copy of your YAML (but in JSON).
    
- Used by Kubernetes to **calculate diffs** and apply only necessary changes.
    

* * *

## 6. Why Declarative > Imperative

- **Imperative replace**: overwrites everything, causing errors or requiring delete/recreate.
    
- **Declarative apply**: smart merge — applies only the intended changes.
    
- Safer, more scalable, especially with complex objects.
    

* * *

# Key Takeaways

- `kubectl apply` = **declarative management** → Kubernetes figures out changes for you.
    
- `kubectl diff` = preview before applying.
    
- Declarative approach is **more complex internally** but avoids the pitfalls of imperative style.
    
- The **last applied configuration** is tracked by Kubernetes to enable smart updates.

* * *

# Migrating from Imperative to Declarative with `kubectl apply`

## 1. Starting Point

- Resource created with **imperative command**:
    
    ```bash
    kubectl create -f nginx-pod.yaml
    ```
    
- At this stage, the object **does not contain** the  
    `last-applied-configuration` annotation in its metadata.
    

* * *

## 2. Switching to Declarative Management

- Run `kubectl apply` on the same file:
    
    ```bash
    kubectl apply -f nginx-pod.yaml
    ```
    
- Kubernetes shows a **warning**:
    
    ```
    Warning: resource ... missing the "last-applied-configuration" annotation -- will be patched automatically
    ```
    
- This means Kubernetes will automatically add the missing annotation.
    

* * *

## 3. Saving the Last Applied Config Explicitly

- Alternative: use `--save-config` during creation:
    
    ```bash
    kubectl create -f nginx-pod.yaml --save-config
    ```
    
- This ensures the **last applied configuration** is stored right from the start.
    

* * *

## 4. After First Apply

- If you check the live configuration:
    
    ```bash
    kubectl get pod nginx-pod -o yaml
    ```
    
- You’ll now find the `kubectl.kubernetes.io/last-applied-configuration` annotation added automatically.
    

* * *

## 5. Key Insight

- You **do not need to delete and recreate** resources to switch from imperative → declarative.
    
- A simple `kubectl apply -f <file>` is enough.
    
- From then on, you can keep using declarative updates seamlessly.
    

* * *

# Takeaway

- **Imperative create** does not track configuration history.
    
- **Declarative apply** requires a "last applied config," but Kubernetes can patch this automatically.
    
- Transitioning is simple → just run `kubectl apply` once, and you’re ready for declarative workflows.
    

* * *

&nbsp;

# Managing Multiple Kubernetes Objects in One or Multiple Files

## 1. Defining Multiple Objects in a Single File

- Use `---` (YAML document separator) to define multiple resources in one file.
    
- Example: `nginx.yaml` containing both a Pod and a Service:
    
    ```yaml
    apiVersion: v1
    kind: Pod
    metadata:
      name: nginx-pod
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx-container
          image: nginx:1.27.0
          resources:
            requests:
              memory: "64Mi"
              cpu: "250m"
            limits:
              memory: "128Mi"
              cpu: "500m"
          ports:
            - containerPort: 80
    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: nginx-service
    spec:
      type: NodePort
      selector:
        app: nginx
      ports:
        - port: 80
          targetPort: 80
          
    ```
    
- Apply both at once:
    
    ```bash
    kubectl apply -f nginx.yaml
    ```
    

* * *

## 2. Behavior with `apply` vs. `create`

- `kubectl apply -f nginx.yaml` → detects existing objects and updates them if needed.
    
- `kubectl create -f nginx.yaml` → errors out if the resource already exists (e.g., duplicate Pod name).
    

* * *

## 3. Alternatives for Organization

### Option A: **Single File with `---`**

- Good for grouping related objects (Pods, Services, Ingress, ConfigMaps, etc.) in one place.
    
- Useful when managing one **application stack** as a unit.
    

### Option B: **Multiple Files in a Directory**

- Each object gets its own YAML file (`nginx-pod.yaml`, `nginx-service.yaml`).
    
- Apply all at once:
    
    ```bash
    kubectl apply -f ./dir/
    
    ```
    
- Easier to **target specific resources** (e.g., apply only Pod changes without touching Service).
    

* * *

## 4. Trade-offs

| Approach | Pros | Cons |
| --- | --- | --- |
| **Single File (---)** | Easier grouping, one apply command | File grows large, harder to maintain, can’t easily apply only part of it |
| **Multiple Files (Directory)** | Easier maintenance, selective updates possible | More files to manage, less compact view |

* * *

## 5. Key Takeaway

You can manage objects in Kubernetes using:

1.  **Imperative commands** (`kubectl run`, `kubectl expose`, `kubectl delete`).
    
2.  **Imperative with config files** (`kubectl create`, `kubectl replace`, `kubectl delete -f`).
    
3.  **Declarative management** (`kubectl apply`, with single or multiple files).
    

The **declarative style** with `apply` is the most powerful and flexible, and will be used extensively moving forward.

* * *

&nbsp;