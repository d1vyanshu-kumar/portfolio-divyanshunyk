# Source of truth about Divyanshu "Nayak" Kumar
Every claim on the site must trace to this file or to the GitHub API. If something is missing, ask. Do not invent or round up.

## Identity and status
- Name: Divyanshu Kumar. Goes by Nayak.
- Based in Gurugram, India.
- Resume tagline: Open Source, Distributed Systems, Infrastructure.
- Hero headline: Backend engineer. I make systems reach the machines they were never designed for.
- Hero sub-line: Two-time GSoC contributor (MIT App Inventor, Debezium). 26 merged pull requests across 13 open source organizations.
- Status chip text: Open to work. Open to remote roles, or relocation with visa sponsorship.
- Public contact: kumardivyanshu118@gmail.com, github.com/d1vyanshu-kumar, linkedin.com/in/divyanshu-kumar-24026b296, x.com/NykDivyanshu, dev.to/d1vyanshukumar
- Never publish a phone number or a date of birth.

## Education
- Starex University, Gurugram. B.Tech, Computer Science. 2023 to 2027 (expected). CGPA 8.34/10.

## Google Summer of Code 2026, Debezium (Red Hat). May 2026 to Sep 2026
Project: Host-Based Pipeline Deployment for the Debezium Platform. Scoped from a design doc into 7 sub-issues. Stack: Java, Quarkus, PostgreSQL, Ansible.
- Problem: Debezium could deploy CDC pipelines only through its Kubernetes operator, which excluded every team running CDC on bare metal or cloud VMs.
- Built the host-based path as a first-class alternative. Both modes ship from one compiled image using Quarkus @LookupIfProperty CDI selection, so existing users upgrade with no config change.
- Automated host discovery: a zero-dependency OpenSSH config parser covering the full ssh_config(5) spec (24 unit tests), a Java NIO WatchService watcher with debounce and scheduled reconciliation, and idempotent Ansible provisioning on an isolated thread pool.
- Deadlock-safe concurrent scheduling with sorted PESSIMISTIC_WRITE locks and atomic file operations. Removed database deadlocks, port collisions, and CI flakiness in the host deployment pipeline.
- Host Agent: a Quarkus daemon deployed via systemd with 6 REST endpoints and bearer-token auth. It returns 202 Accepted so a slow remote deploy never blocks a conductor thread.
- Restructured the code across repeated maintainer review: business logic moved from REST controllers into services, JPA entity leaks replaced with domain records, Command pattern for Ansible execution.
- Demoed the engine live to the Debezium community and published a technical deep-dive.
- Published post: "Building Zero-Touch Host Provisioning for the Debezium Platform" on dev.to. Flow: edit ~/.ssh/config, host discovered, Ansible provisions it, host marked READY. A logged run completed in 10m 43s, including pre-pulling a Debezium Server image of about 500MB.
- Design doc PR: https://github.com/debezium/debezium-design-documents/pull/45
- Tracking issue: https://github.com/debezium/dbz/issues/2085
- Final report: https://github.com/debezium/debezium-design-documents/blob/main/gsoc/2026/d1vyanshu-kumar/final_submission.md
- Blog post: https://dev.to/d1vyanshukumar/building-zero-touch-host-provisioning-for-the-debezium-platform-6nc

## Google Summer of Code 2025, MIT App Inventor. May 2025 to Sep 2025
Project: Mobile-Responsive Layout for App Inventor. Stack: GWT, Java, Blockly, UiBinder.
- Rebuilt the project dashboard, Designer, and Blockly editor as responsive GWT UiBinder layouts for phones. Every core feature preserved. 6,492 lines across 59 files, accepted for the platform's winter release.
- Prototyped the interaction model in Figma first: a bottom tab bar for tool and property panels, a space-efficient Designer canvas, and touch gestures for block drag, zoom, and pan.
- Shipped 6 further merged fixes: project explorer, folder-name validation, dragged-PNG extension handling, nested-block warning counts.
- Final report: https://gist.github.com/d1vyanshu-kumar/2328d9bdf1b4aeca6e1d93c6123163d2

## Open source
- 47 pull requests across 20 repositories in 13 organizations. 26 merged. Languages: Java, TypeScript, JavaScript, Python, Go. (Refresh from the GitHub API at build time.)
- Merged into the Debezium core engine outside project scope: a false CDC-disabled error when no tables were tracked (https://github.com/debezium/debezium/pull/7132), and a null jsonb after-image on an unchanged TOASTed column (https://github.com/debezium/debezium/pull/7168).
- Also merged: a responsive fix to Kubernetes SIGs Headlamp (CNCF) (https://github.com/kubernetes-sigs/headlamp/pull/4463) and unit tests for nostream (https://github.com/cameri/nostream/pull/470).
- Filed 16 issues in projects I do not own: Sugarizer, Webiu, Headlamp, Kruise, ImageLab, GDB-UI.
- Earlier: C4GT 2024, backend features for Avni (Samanway Foundation).
- Full contribution log: https://docs.google.com/document/d/1mP5n6P_U8J4taswqQXOP4xJ-wegROmPZDi5m2TqyFyw/edit?usp=sharing

## Project: Event-Driven E-commerce Microservices (Nov 2024)
Java, Spring Boot, Spring Cloud Gateway, Kafka, Keycloak, MySQL, MongoDB, Docker.
- Six independently deployable services (product, order, inventory, notification, API gateway, web front end) so a slow inventory lookup cannot block order placement.
- Spring Cloud Gateway as OAuth2 resource server validating JWTs from Keycloak 24 with an imported realm. Aggregated Swagger and OpenAPI docs behind one endpoint.
- Order and inventory decoupled over Kafka with Avro and a Schema Registry. Resilience4j circuit breakers.
- Zipkin tracing, Prometheus, Flyway migrations, Testcontainers and contract stubs. Docker images deployed on Kubernetes.
- Source: https://gist.github.com/d1vyanshu-kumar/4eea00af2cf31e0635f88d13ac4eebd8

## Skills
- Languages: Java, SQL, TypeScript, JavaScript, Go
- Backend: Spring Boot, Spring Cloud Gateway, Spring Security (OAuth2, JWT), Quarkus, REST, OpenAPI, Keycloak
- Data and messaging: PostgreSQL, MySQL, MongoDB, Kafka (Avro, Schema Registry), JPA and Hibernate, Flyway
- Infra and testing: Docker, Kubernetes, Ansible, systemd, CI/CD, Prometheus, Zipkin, JUnit, Testcontainers
- Frontend and architecture: React, Next.js, GWT and UiBinder, Clean Architecture, Microservices, Event-Driven Design
