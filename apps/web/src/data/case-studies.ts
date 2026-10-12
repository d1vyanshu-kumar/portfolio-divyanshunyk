export interface CaseStudy {
  slug: string;
  title: string;
  subtitle: string;
  org: string;
  period: string;
  role: string;
  featured: boolean;
  tags: string[];
  metrics: { label: string; value: string }[];
  context: string;
  constraint: string;
  decisions: { title: string; explanation: string; alternative: string }[];
  flowSteps?: { step: string; title: string; detail: string }[];
  diagramType: "debezium" | "mit" | "ecommerce" | "opensource";
  links: { label: string; url: string }[];
  todoNote: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "debezium-host-deployment",
    title: "Host-Based Pipeline Deployment for the Debezium Platform",
    subtitle:
      "Extending change data capture to bare metal and cloud VMs through zero-touch host discovery, concurrent scheduling, and Quarkus CDI selection.",
    org: "Debezium (Red Hat)",
    period: "May 2026 - Sep 2026",
    role: "Google Summer of Code 2026 Contributor",
    featured: true,
    tags: ["Java", "Quarkus", "PostgreSQL", "Ansible", "OpenSSH", "systemd", "GSoC 2026"],
    metrics: [
      { label: "Pipeline Runtime", value: "10m 43s" },
      { label: "Image Pre-pulled", value: "~500 MB" },
      { label: "Scoped Issues", value: "7 Sub-issues" },
      { label: "SSH Parser Tests", value: "24 Unit Tests" },
      { label: "Daemon Endpoints", value: "6 REST Endpoints" }
    ],
    context:
      "Debezium is the leading open source distributed platform for Change Data Capture (CDC). Previously, Debezium Server pipelines could be orchestrated exclusively through its Kubernetes operator. This architectural constraint excluded engineering organizations operating high-throughput databases on bare-metal clusters, non-containerized private clouds, or dedicated virtual machines.",
    constraint:
      "The host-based deployment path had to ship from the exact same compiled binary image as Kubernetes mode, requiring zero breaking configuration changes for existing enterprise users. Remote Ansible deployment tasks could not block conductor threads, and concurrent host provisioning required strict deadlock prevention.",
    decisions: [
      {
        title: "Quarkus CDI Selection (@LookupIfProperty)",
        explanation:
          "Leveraged Quarkus @LookupIfProperty to select deployment orchestrators at build/runtime without polluting the core engine with conditional runtime branches. This enables a unified container image with dead-code elimination.",
        alternative: "Considered runtime reflection and factory patterns; rejected due to increased startup overhead and loss of GraalVM native image compatibility."
      },
      {
        title: "Zero-Dependency OpenSSH Config Parser",
        explanation:
          "Implemented a custom OpenSSH config parser fully covering the ssh_config(5) specification backed by 24 unit tests, paired with a Java NIO WatchService with debounce and scheduled reconciliation.",
        alternative: "Evaluated JSch and Apache MINA SSHD; rejected due to heavy transitive dependencies and incomplete handling of Host / Match blocks."
      },
      {
        title: "Deadlock-Safe Scheduling with Sorted Locks",
        explanation:
          "Eliminated database deadlocks and port collisions in high-concurrency environments by implementing sorted PESSIMISTIC_WRITE locks combined with atomic file operations and Command-pattern Ansible runners.",
        alternative: "Considered optimistic locking with retry backoff; rejected because provisioning conflicts caused wasted compute and partial disk allocations."
      },
      {
        title: "Asynchronous Host Agent Daemon",
        explanation:
          "Architected a lightweight Quarkus daemon deployed via systemd exposing 6 REST endpoints with bearer-token authorization. Endpoints return 202 Accepted immediately so slow multi-gigabyte remote deployments never block central conductor threads.",
        alternative: "Considered direct synchronous SSH command execution from the orchestrator; rejected because long-lived SSH connections dropped under network jitter."
      }
    ],
    flowSteps: [
      { step: "01", title: "Edit ~/.ssh/config", detail: "Engineer declares target host IP, port, identity file, and SSH parameters." },
      { step: "02", title: "Host Discovered", detail: "Java NIO WatchService detects file modification with debounce and triggers reconciliation." },
      { step: "03", title: "Ansible Provisions", detail: "Isolated thread pool triggers idempotent Ansible playbook, verifies systemd daemon, and pre-pulls ~500MB image." },
      { step: "04", title: "Host Marked READY", detail: "Health checks pass, bearer tokens exchange, and conductor marks pipeline node READY in 10m 43s." }
    ],
    diagramType: "debezium",
    links: [
      { label: "Design Document PR #45", url: "https://github.com/debezium/debezium-design-documents/pull/45" },
      { label: "Tracking Issue #2085", url: "https://github.com/debezium/dbz/issues/2085" },
      { label: "Technical Deep-Dive on dev.to", url: "https://dev.to/d1vyanshukumar/building-zero-touch-host-provisioning-for-the-debezium-platform-6nc" },
      { label: "GSoC Final Submission Report", url: "https://github.com/debezium/debezium-design-documents/blob/main/gsoc/2026/d1vyanshu-kumar/final_submission.md" }
    ],
    todoNote: "TODO: Divyanshu to reflect on future enhancements (e.g. gRPC streaming telemetry vs REST polling, multi-tenant agent isolation)."
  },
  {
    slug: "mit-app-inventor",
    title: "Mobile-Responsive Layout for MIT App Inventor",
    subtitle:
      "Transforming a desktop-only visual programming IDE into an adaptive mobile experience across 6,492 lines and 59 files.",
    org: "MIT App Inventor",
    period: "May 2025 - Sep 2025",
    role: "Google Summer of Code 2025 Contributor",
    featured: true,
    tags: ["GWT", "Java", "Blockly", "UiBinder", "Figma", "GSoC 2025"],
    metrics: [
      { label: "Code Modified", value: "6,492 LOC" },
      { label: "Files Preserved", value: "59 Files" },
      { label: "Additional Fixes", value: "6 Merged PRs" },
      { label: "Release", value: "Winter Release" }
    ],
    context:
      "MIT App Inventor empowers millions of students globally to build mobile apps using visual blocks. However, the authoring environment was strictly optimized for desktop screens with a minimum width of 1280px. Students without desktop computers were locked out of developing apps on their phones and tablets.",
    constraint:
      "Every single core authoring capability (Project Dashboard, Designer canvas, component properties, and Blockly workspace) had to be preserved without branching into a divergent mobile codebase.",
    decisions: [
      {
        title: "Adaptive GWT UiBinder Architecture",
        explanation:
          "Re-architected the legacy GWT UI with responsive UiBinder templates that fluidly collapse multi-column desktop toolbars into contextual mobile drawers.",
        alternative: "Considered writing a standalone lightweight mobile web client; rejected because maintaining two divergent visual programming runtimes was unsustainable for maintainers."
      },
      {
        title: "Bottom Tab Bar Navigation Model",
        explanation:
          "Prototyped the mobile interaction model in Figma first, introducing a mobile-first bottom bar that switches between Palette, Viewer, and Properties without sacrificing viewport canvas.",
        alternative: "Evaluated hamburger drawer menus; rejected because block editing requires rapid toggling between properties and the canvas."
      },
      {
        title: "Blockly Touch Gesture Support",
        explanation:
          "Engineered touch gesture handlers for smooth block drag-and-drop, pinch-to-zoom, and inertial canvas panning, preventing mobile browser scroll interference.",
        alternative: "Relying on default mobile browser zoom; rejected because zooming the whole viewport breaks coordinate mapping in SVG block workspaces."
      }
    ],
    diagramType: "mit",
    links: [
      { label: "GSoC Final Submission Summary", url: "https://gist.github.com/d1vyanshu-kumar/2328d9bdf1b4aeca6e1d93c6123163d2" }
    ],
    todoNote: "TODO: Divyanshu to reflect on future layout optimizations (e.g. collapsible hierarchy trees, gesture customization)."
  },
  {
    slug: "ecommerce-microservices",
    title: "Event-Driven E-commerce Microservices Architecture",
    subtitle:
      "Decoupled microservice cluster powered by Kafka Avro serialization, Keycloak 24 OAuth2 gateway, and Resilience4j circuit breaking.",
    org: "Personal Engineering Project",
    period: "Nov 2024",
    role: "System Designer & Backend Engineer",
    featured: false,
    tags: ["Spring Boot", "Kafka", "Keycloak", "PostgreSQL", "Docker", "Kubernetes", "Avro"],
    metrics: [
      { label: "Microservices", value: "6 Services" },
      { label: "Auth Server", value: "Keycloak 24" },
      { label: "Event Pipeline", value: "Kafka + Avro" },
      { label: "Tracing", value: "Zipkin + Prometheus" }
    ],
    context:
      "Synchronous inter-service HTTP communication creates tight coupling: when inventory verification or payment gateways slow down, order placement threads exhaust connection pools and crash the entire platform.",
    constraint:
      "Order creation response time must remain invariant under downstream dependency outages. Schema modifications between services must be strictly backward and forward compatible.",
    decisions: [
      {
        title: "Asynchronous Event Sourcing with Kafka & Avro",
        explanation:
          "Decoupled checkout processing from inventory allocation using Apache Kafka. Events are serialized with Apache Avro schemas registered in Confluent Schema Registry for strict contract validation.",
        alternative: "Considered REST calls with retry policies; rejected because retry storms exacerbate downstream database saturation."
      },
      {
        title: "Spring Cloud Gateway OAuth2 Resource Server",
        explanation:
          "Consolidated authentication and route authorization into an API Gateway acting as a stateless OAuth2 resource server validating JWT tokens issued by Keycloak 24.",
        alternative: "Considered service-to-service mTLS without central gateway; rejected due to high configuration complexity in development environments."
      },
      {
        title: "Resilience4j Circuit Breakers & Dead Letter Queues",
        explanation:
          "Configured circuit breakers with fallback queues: when inventory lookups exceed latency thresholds, orders enter a pending state and inventory is reconciled asynchronously without dropping customer orders.",
        alternative: "Considered failing fast with immediate 503 errors; rejected due to lost customer conversions."
      }
    ],
    diagramType: "ecommerce",
    links: [
      { label: "Architecture Source & Implementation Gist", url: "https://gist.github.com/d1vyanshu-kumar/4eea00af2cf31e0635f88d13ac4eebd8" }
    ],
    todoNote: "TODO: Divyanshu to reflect on scaling choices (e.g. Saga orchestrator vs choreography, multi-region Kafka replication)."
  },
  {
    slug: "open-source-map",
    title: "Open Source Engineering Impact Across 13 Organizations",
    subtitle:
      "26 merged pull requests across 20 repositories in Debezium, Kubernetes SIGs, nostream, and beyond.",
    org: "Open Source Ecosystem",
    period: "2024 - 2026",
    role: "Open Source Contributor",
    featured: false,
    tags: ["Java", "TypeScript", "Go", "Python", "PostgreSQL", "Kubernetes", "Open Source"],
    metrics: [
      { label: "Pull Requests", value: "47 Total" },
      { label: "Merged PRs", value: "26 Merged" },
      { label: "Repositories", value: "20 Repos" },
      { label: "Organizations", value: "13 Orgs" },
      { label: "External Issues", value: "16 Reported" }
    ],
    context:
      "Contributing to large-scale production open source engines requires deep codebase comprehension, navigating distributed consensus, and passing rigorous maintainer review bars.",
    constraint:
      "Changes to core distributed frameworks like Debezium or CNCF Kubernetes SIGs Headlamp must have zero regressions, pass extensive unit and integration suites, and adhere to strict licensing.",
    decisions: [
      {
        title: "Debezium Core Engine CDC Bugfix (PR #7132)",
        explanation:
          "Diagnosed and resolved a regression where the Debezium core connector emitted a false 'CDC-disabled' error when no database tables were actively tracked.",
        alternative: "Submitted comprehensive test case to prevent future regressions."
      },
      {
        title: "PostgreSQL TOASTed Column JSONB After-Image (PR #7168)",
        explanation:
          "Fixed a critical data inconsistency bug where an unchanged TOASTed column produced a null jsonb after-image in the event change stream, preserving data fidelity.",
        alternative: "Collaborated directly with Red Hat engineers during maintainer review."
      },
      {
        title: "Kubernetes SIGs Headlamp (CNCF) UI Responsiveness (PR #4463)",
        explanation:
          "Resolved responsive breakpoint issues in the Kubernetes cluster management dashboard to ensure operational visibility on tablets and mobile devices.",
        alternative: "Preserved desktop cluster tree views while streamlining mobile telemetry widgets."
      },
      {
        title: "nostream High-Performance Relay Tests (PR #470)",
        explanation:
          "Authored end-to-end unit and integration test suites for the high-throughput Nostr relay implementation in TypeScript.",
        alternative: "Increased test coverage across concurrent websocket subscriptions."
      }
    ],
    diagramType: "opensource",
    links: [
      { label: "Debezium PR #7132", url: "https://github.com/debezium/debezium/pull/7132" },
      { label: "Debezium PR #7168", url: "https://github.com/debezium/debezium/pull/7168" },
      { label: "Headlamp PR #4463 (CNCF)", url: "https://github.com/kubernetes-sigs/headlamp/pull/4463" },
      { label: "nostream PR #470", url: "https://github.com/cameri/nostream/pull/470" },
      { label: "Complete Contribution Log", url: "https://docs.google.com/document/d/1mP5n6P_U8J4taswqQXOP4xJ-wegROmPZDi5m2TqyFyw/edit?usp=sharing" }
    ],
    todoNote: "TODO: Divyanshu to reflect on future upstream contributions (e.g. Debezium 3.0 virtual column support, Apache Kafka connector optimizations)."
  }
];
