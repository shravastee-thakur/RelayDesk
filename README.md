# RelayDesk

> A real-time customer support platform for managing prioritized support requests, agent workloads, and customer conversations.

### RelayDesk is a full-stack customer support system built around a real-time ticket workflow.



<img width="1259" height="685" alt="Admin" src="https://github.com/user-attachments/assets/2d126d31-a63d-4c6c-a5df-c1b555b8c926" />
<img width="1263" height="685" alt="Agent" src="https://github.com/user-attachments/assets/0326c2c4-c754-43c7-804a-9d55c26216ef" />
<img width="1254" height="676" alt="Customer" src="https://github.com/user-attachments/assets/f0208a40-ab1c-4a3a-816f-870ba2816c3f" />




Customers can create and track support requests, agents can manage a priority-based queue and communicate with customers in real time, and administrators can monitor tickets, agents, and support activity.

The project focuses on backend engineering concepts such as authentication, authorization, transactional ticket assignment, real-time communication, Redis-backed state, and audit history.

---

## Features

### Authentication & Authorization

- User registration with customer role by default
- OTP-based login
- JWT access and refresh tokens
- Refresh token rotation
- Refresh token reuse detection
- Secure logout
- Role-based access control
- Protected customer, agent, and admin workflows

### Customer

- Create support tickets
- Automatic ticket priority calculation
- View submitted tickets
- View ticket details
- Cancel tickets while they are waiting
- View ticket activity history
- Real-time communication with support agents
- Receive real-time ticket status updates

### Agent

- View the waiting support queue
- Priority-based ticket ordering
- Take the next available ticket
- Maximum active-ticket limit
- View active tickets
- View previously handled tickets
- Start tickets
- Resolve tickets
- Close tickets
- Update ticket priority
- View ticket history
- Real-time customer communication
- Real-time queue and ticket updates

### Admin

- View all support tickets
- View ticket and customer/agent information
- Create support agents
- View support statistics
- Monitor support operations

### Real-Time Communication

- Socket.IO authentication using JWT
- Ticket-scoped Socket.IO rooms
- Real-time chat between customers and agents
- Real-time ticket assignment events
- Real-time status updates
- Real-time agent dashboard queue updates
- Online agent presence

### Redis

- OTP storage with expiration
- Atomic OTP verification using Lua
- OTP attempt limiting
- Agent online presence
- TTL-based presence tracking

### Ticket History

Tracks important ticket lifecycle events such as:

- Ticket creation
- Assignment
- Status changes

Example:

```text
WAITING
   ↓
ASSIGNED
   ↓
IN_PROGRESS
   ↓
RESOLVED
   ↓
CLOSED
```
## Architecture

RelayDesk follows a layered backend architecture.
```
                         ┌─────────────────────┐
                         │    React Frontend   │
                         └──────────┬──────────┘
                                    │
                     HTTP           │        Socket.IO
                                    │
                         ┌──────────▼──────────┐
                         │   Node.js / Express │
                         │     Socket.IO       │
                         └───────┬─────┬───────┘
                                 │     │
                         ┌───────▼─┐ ┌─▼─────────┐
                         │ Services │ │  Socket   │
                         │          │ │  Events   │
                         └────┬─────┘ └────┬──────┘
                              │            │
                       ┌──────▼──────┐     │
                       │ Repositories│     │
                       └──────┬──────┘     │
                              │            │
                    ┌─────────▼─────┐  ┌──▼─────┐
                    │ PostgreSQL    │  │ Redis  │
                    │    / Neon     │  │        │
                    └───────────────┘  └────────┘
```
## Core Ticket Workflow
```text
Customer creates ticket
        │
        ▼
Priority calculated
        │
        ▼
WAITING queue
        │
        ▼
Agent takes next ticket
        │
        ▼
ASSIGNED
        │
        ▼
IN_PROGRESS
        │
        ▼
Customer ↔ Agent conversation
        │
        ▼
RESOLVED
        │
        ▼
CLOSED
```
Ticket assignment is handled transactionally so multiple agents cannot claim the same waiting ticket.

## Authentication Flow

RelayDesk uses a two-step login process.

```text
Email + Password
        │
        ▼
Credential verification
        │
        ▼
OTP generated and stored in Redis
        │
        ▼
OTP verification
        │
        ▼
Access Token + Refresh Token
```
Refresh tokens are rotated on refresh, and previously used refresh tokens are tracked to detect token reuse.

## Priority-Based Queue

Customers do not manually select ticket priority.

The backend calculates priority from the ticket content.

Tickets are then ordered using:
```text
URGENT
   ↓
HIGH
   ↓
MEDIUM
   ↓
LOW
```
Within the same priority level, older tickets are handled first.
### Concurrent Ticket Assignment

When an agent selects Take Next Ticket, RelayDesk uses a PostgreSQL transaction with row-level locking:

```text
Agent A ───────┐
               │
               ▼
          Waiting Queue
               ▲
               │
Agent B ───────┘
```
PostgreSQL locking ensures that two agents cannot successfully claim the same ticket.

## Real-Time Architecture

Socket.IO is used for live updates.

Ticket rooms

Each ticket gets its own Socket.IO room:

```text
ticket:<ticketId>
```

The customer and assigned agent join the ticket room.

Events include:

```text
ticket_created
ticket_assigned
ticket_status_updated
new_message
```

Example:

```text
Customer sends message
        │
        ▼
Socket.IO
        │
        ▼
Message Service
        │
        ▼
PostgreSQL
        │
        ▼
Ticket Room
        │
        ├──────────────► Customer
        │
        └──────────────► Agent
```

Messages are persisted in PostgreSQL before being broadcast.

## User Roles

RelayDesk has three application roles.

### Role	Responsibilities
- Customer	Create and track support tickets
- Agent	Handle tickets and communicate with customers
- Admin	Monitor tickets, manage agents, and view statistics

New public registrations are created as customer.

Agents are created through an admin-only workflow.

## Tech Stack
### Frontend
React
TypeScript
React Router
Zustand
Axios
Socket.IO Client
Tailwind CSS
React Hot Toast
Lucide React
### Backend
Node.js
TypeScript
Express
Socket.IO
JWT
bcrypt
Zod
Axios
### Database
PostgreSQL
Neon PostgreSQL
Drizzle ORM
### Caching / Real-Time State
Redis
ioredis
Email
Brevo
### Testing / API Development
Postman

## Engineering Decisions
### Why PostgreSQL?

The application has strongly related entities such as users, tickets, agents, messages, and history.

PostgreSQL provides:

- relational integrity
- transactions
- foreign keys
- indexing
- row-level locking
- strong consistency
### Why Redis?

Redis is used for data that benefits from short-lived, fast-access storage.

Current use cases include:

- OTPs
- OTP attempt tracking
- agent presence
### Why Socket.IO?

Support conversations and queue changes benefit from immediate updates without requiring clients to repeatedly refresh the application.

### Why Drizzle ORM?

Drizzle provides type-safe database access while keeping SQL concepts visible and explicit.

## Project Goals

RelayDesk was built to explore practical backend engineering concepts beyond basic CRUD APIs.

The project focuses on:

- Authentication and token security
- Role-based authorization
- Relational database design
- Transactional operations
- Concurrency handling
- Real-time communication
- Redis-based temporary state
- Event-driven application behavior
- API layering and separation of responsibilities
