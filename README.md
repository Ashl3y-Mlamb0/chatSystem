# Project: Text/Video Chat System

## Introduction

This project aims to build a real-time text/video chat system with three permission levels: Super Admin, Group Admin, and User. The system will be implemented using the MEAN stack (MongoDB, Express, Angular, Node) along with Socket.io and Peer.js.

## Git Repository Organization

* **Repository Name:** `chat_system`
* **Branching Strategy:**
    * `main`: Stable, deployable code.
    * `develop`:  Main development branch, merged into `main` when ready for release.
    * `feature/[feature_name]`:  Branches for individual features or user stories.
* **Update Frequency:** Frequent commits, at least daily during active development. Push to remote repository regularly.
* **Server/Frontend Separation:**
    * `client`: Angular frontend code.
    * `server`:  Node.js/Express backend code.

## Data Structures

### Client-Side

* **User:**
    * `username`: string 
    * `email`: string
    * `id`: string (UUID or other unique identifier)
    * `roles`:  array of strings (e.g., 'user', 'groupAdmin', 'superAdmin')
    * `groups`: array of group IDs that the user belongs to

* **Group:**
    * `id`: string 
    * `name`: string 
    * `admins`: array of user IDs who are admins of this group
    * `channels`: array of channel IDs within this group

* **Channel:**
    * `id`: string
    * `name`: string 
    * `groupId`:  ID of the group this channel belongs to

* **Message:** (Used for displaying messages in the chat interface)
    * `_id`: Unique identifier for the message (e.g., ObjectId in MongoDB)
    * `channelId`: ID of the channel this message belongs to
    * `sender`: ID or username of the sender
    * `content`: The text content of the message
    * `timestamp`: The date and time the message was sent (optional)

### Server-Side (MongoDB)

* **User:** (Similar to client-side, but may include additional fields like password hash, etc.)
* **Group:** (Similar to client-side)
* **Channel:** (Similar to client-side)
* **Message:** (Same structure as the client-side `Message`)

## Angular Architecture

* **Components:**
    * `LoginComponent`:  Handles user authentication.
    * `SignupComponent`:  Handles user registration.
    * `ChatComponent`:  Main chat interface, displays messages, allows sending messages.
    * `GroupListComponent`:  Displays list of groups the user belongs to.
    * `ChannelListComponent`:  Displays list of channels within a selected group.
    * `AdminComponent`: UI for admin functions (add/modify/delete users, groups, channels)

* **Services:**
    * `AuthService`: Handles user authentication and authorization.
    * `ChatService`:  Manages real-time communication using Socket.io.
    * `UserService`:  Handles user data and interactions.
    * `GroupService`:  Handles group data and interactions.
    * `ChannelService`: Handles channel data and interactions.

* **Models:**
    * `User`, `Group`, `Channel` classes to represent data structures.

* **Routes:**
    * `/login`:  `LoginComponent`
    * `/signup`:  `SignupComponent`
    * `/chat`: `ChatComponent` 
    * `/groups`: `GroupListComponent` 
    * `/channels`: `ChannelListComponent` 
    * `/admin`: `AdminComponent`

## Node Server Architecture

* **Modules:**
    * `user`: User-related routes and logic.
    * `group`:  Group-related routes and logic
    * `channel`: Channel-related routes and logic
    * `auth`: Authentication and authorization middleware.

* **Functions, Files, Global Variables:** (To be detailed as implementation progresses)

### Server-Side Routes

**Authentication**

| Route | Method | Parameters | Return Value | Purpose |
|---|---|---|---|---|
| `/api/auth/login` | `POST` | `username`, `password` | `user` object (with token) or error | Authenticates a user and returns a token |
| `/api/auth/signup` | `POST` | `username`, `email`, `password` | `user` object or error | Registers a new user |
| `/api/auth/logout` | `POST` | (token in header) | Success message or error | Logs out the current user (invalidates token) |

**User Management (Admin Only)**

| Route | Method | Parameters | Return Value | Purpose |
|---|---|---|---|---|
| `/api/users` | `GET` | (token in header) | Array of `user` objects | Fetches all users |
| `/api/users/:id` | `GET` | `id`, (token in header) | `user` object or error | Fetches a specific user by ID |
| `/api/users/:id` | `PUT` | `id`, updated `user` data, (token in header) | Updated `user` object or error | Updates a specific user by ID |
| `/api/users/:id` | `DELETE` | `id`, (token in header) | Success message or error | Deletes a specific user by ID |

**Group Management**

| Route | Method | Parameters | Return Value | Purpose |
|---|---|---|---|---|
| `/api/groups` | `GET` | (token in header) | Array of `group` objects | Fetches all groups |
| `/api/groups` | `POST` | `name`, (token in header) | `group` object or error | Creates a new group (admin only) |
| `/api/groups/:id` | `GET` | `id`, (token in header) | `group` object or error | Fetches a specific group by ID |
| `/api/groups/:id` | `PUT` | `id`, updated `group` data, (token in header) | Updated `group` object or error | Updates a specific group by ID (group admin or super admin) |
| `/api/groups/:id` | `DELETE` | `id`, (token in header) | Success message or error | Deletes a specific group by ID (group admin or super admin) |
| `/api/groups/:id/join` | `POST` | `id`, (token in header) | Success message or error | User joins a group |
| `/api/groups/:id/leave` | `POST` | `id`, (token in header) | Success message or error | User leaves a group |

**Channel Management**

| Route | Method | Parameters | Return Value | Purpose |
|---|---|---|---|---|
| `/api/channels` | `GET` | `groupId`, (token in header) | Array of `channel` objects | Fetches channels within a group |
| `/api/channels` | `POST` | `name`, `groupId`, (token in header) | `channel` object or error | Creates a new channel within a group (group admin only) |
| `/api/channels/:id` | `GET` | `id`, (token in header) | `channel` object or error | Fetches a specific channel by ID |
| `/api/channels/:id` | `PUT` | `id`, updated `channel` data, (token in header) | Updated `channel` object or error | Updates a specific channel by ID (group admin only) |
| `/api/channels/:id` | `DELETE` | `id`, (token in header) | Success message or error | Deletes a specific channel by ID (group admin only) |
| `/api/channels/:id/join` | `POST` | `id`, (token in header) | Success message or error | User joins a channel |
| `/api/channels/:id/leave` | `POST` | `id`, (token in header) | Success message or error | User leaves a channel |

**Chat**

| Route | Method | Parameters | Return Value | Purpose |
|---|---|---|---|---|
| `/api/chat/messages` | `GET` | `channelId`, (token in header) | Array of `message` objects | Fetches chat messages for a channel |
| `/api/chat/messages` | `POST` | `channelId`, `message` content, (token in header) | `message` object or error | Sends a new chat message to a channel |

## Client-Server Interaction

* **Data Changes on Server:**
    * User login/registration
    * Group/channel creation, modification, deletion
    * User joining/leaving groups
    * Real-time chat messages (using Socket.io)

* **Angular Component Updates:**
    * Upon successful login, navigate to `/chat` and display the `ChatComponent`.
    * `GroupListComponent` and `ChannelListComponent` update based on user data fetched from the server.
    * `ChatComponent` displays messages received in real-time via Socket.io.
    * `AdminComponent` allows admins to perform their functions, updating the UI and server data accordingly.

## Additional Notes

* This README will be updated as the project progresses.
* Phase 1 focuses on setting up the Angular structure and client-side data handling.
* Phase 2 will implement the Node server, MongoDB integration, and real-time communication.
* **Messages will be stored in a separate collection in MongoDB for better scalability and flexibility.**
