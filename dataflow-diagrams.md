# Globetrotter Travel Booking Application - Data Flow Diagrams

## Level 0 Data Flow Diagram (Context Diagram)

```
                    ┌─────────────────┐
                    │   Stripe API    │
                    │  (External)     │
                    └─────────┬───────┘
                              │ Payment Processing
                              │ & Confirmations
                              ▼
    ┌─────────────┐    ┌─────────────────────────┐    ┌─────────────┐
    │   Travel    │◄──►│                         │◄──►│   Admin     │
    │  Customers  │    │    GLOBETROTTER        │    │  Users      │
    │             │    │  Travel Booking App     │    │             │
    └─────────────┘    │                         │    └─────────────┘
           ▲           └─────────────────────────┘           ▲
           │                        ▲                        │
           │                        │                        │
           ▼                        ▼                        ▼
    • Booking Requests       ┌─────────────┐         • User Management
    • User Registration      │ PostgreSQL  │         • Analytics Data
    • Payment Information    │  Database   │         • Activity Logs
    • Trip Inquiries         │ (External)  │         • System Reports
    • Destination Searches   └─────────────┘         • Settings Config
    • Profile Updates              ▲
                                  │
                                  ▼
                            • User Data
                            • Booking Records
                            • Destination Info
                            • Session Data
                            • Activity Logs
```

## Level 1 Data Flow Diagram (System Overview)

```
                                GLOBETROTTER TRAVEL BOOKING SYSTEM
    ┌─────────────┐
    │   Travel    │
    │  Customers  │
    └─────┬───────┘
          │
          ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────┐
    │                              FRONTEND LAYER                                         │
    │                                                                                     │
    │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐             │
    │  │    Home     │  │ Destinations │  │   Booking   │  │   My Trips  │             │
    │  │   Page      │  │   Browser    │  │   System    │  │  Dashboard  │             │
    │  │             │  │              │  │             │  │             │             │
    │  │ • 3D Globe  │  │ • Search     │  │ • Payment   │  │ • Trip Mgmt │             │
    │  │ • Featured  │  │ • Filter     │  │ • Calendar  │  │ • Bookings  │             │
    │  └─────────────┘  └──────────────┘  └─────────────┘  └─────────────┘             │
    │                                           │                                        │
    └───────────────────────────────────────────┼────────────────────────────────────────┘
                                                │ API Requests/Responses
                                                ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────┐
    │                              BACKEND LAYER                                          │
    │                                                                                     │
    │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐             │
    │  │    Auth     │  │ Destinations │  │   Booking   │  │    Admin    │             │
    │  │  Service    │  │   Service    │  │   Service   │  │   Service   │             │
    │  │             │  │              │  │             │  │             │             │
    │  │ • Login     │  │ • Get All    │  │ • Create    │  │ • Analytics │             │
    │  │ • Register  │  │ • Search     │  │ • Update    │  │ • User Mgmt │             │
    │  │ • Sessions  │  │ • Details    │  │ • Cancel    │  │ • Reports   │             │
    │  └─────────────┘  └──────────────┘  └─────────────┘  └─────────────┘             │
    │                                           │                                        │
    └───────────────────────────────────────────┼────────────────────────────────────────┘
                                                │ Database Queries
                                                ▼
    ┌─────────────────────────────────────────────────────────────────────────────────────┐
    │                              DATA LAYER                                             │
    │                                                                                     │
    │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────┐             │
    │  │    Users    │  │ Destinations │  │   Bookings  │  │  Activity   │             │
    │  │   Table     │  │    Table     │  │    Table    │  │    Logs     │             │
    │  │             │  │              │  │             │  │             │             │
    │  │ • Profile   │  │ • Details    │  │ • Trip Data │  │ • Actions   │             │
    │  │ • Auth      │  │ • Pricing    │  │ • Status    │  │ • Tracking  │             │
    │  │ • Sessions  │  │ • Features   │  │ • Payments  │  │ • Audit     │             │
    │  └─────────────┘  └──────────────┘  └─────────────┘  └─────────────┘             │
    │                                                                                     │
    └─────────────────────────────────────────────────────────────────────────────────────┘
                                                ▲
                                                │
                                                ▼
                                    ┌─────────────────┐
                                    │   PostgreSQL    │
                                    │    Database     │
                                    └─────────────────┘

                            ┌─────────────────┐
                            │   Stripe API    │
                            │    Payment      │
                            │   Processing    │
                            └─────────────────┘
                                    ▲
                                    │ Payment Intents
                                    │ & Confirmations
                                    ▼
                              ┌─────────────┐
                              │   Booking   │
                              │   Service   │
                              └─────────────┘

    ┌─────────────┐                                                    ┌─────────────┐
    │    Admin    │                                                    │   Travel    │
    │   Users     │◄──────────────────────────────────────────────────►│  Customers  │
    └─────────────┘                                                    └─────────────┘
          ▲                                                                     ▲
          │                                                                     │
          ▼                                                                     ▼
    • User Management                                                    • Trip Booking
    • System Analytics                                                   • Destination Search
    • Activity Monitoring                                               • Payment Processing
    • Settings Control                                                  • Profile Management
    • Report Generation                                                 • Trip Management
```

## Data Flow Descriptions

### Level 0 Data Flows:

1. **Travel Customers ↔ System:**
   - Booking requests and confirmations
   - User registration and authentication
   - Destination searches and details
   - Payment information
   - Profile updates

2. **Admin Users ↔ System:**
   - User management operations
   - Analytics and reporting data
   - System configuration
   - Activity monitoring

3. **System ↔ PostgreSQL Database:**
   - User data storage/retrieval
   - Booking records management
   - Destination information
   - Session data persistence
   - Activity logging

4. **System ↔ Stripe API:**
   - Payment processing
   - Transaction confirmations
   - Payment intent creation

### Level 1 Data Flows:

#### Frontend Layer:
- **User Interactions:** Form submissions, navigation, search queries
- **API Communications:** RESTful requests to backend services
- **Real-time Updates:** WebSocket connections for notifications

#### Backend Layer:
- **Authentication Service:** Login/logout, session management, password hashing
- **Destination Service:** CRUD operations, search, filtering
- **Booking Service:** Trip creation, payment integration, status updates
- **Admin Service:** Analytics generation, user management, reporting

#### Data Layer:
- **Users Table:** Authentication data, profiles, preferences
- **Destinations Table:** Travel locations, pricing, availability
- **Bookings Table:** Trip details, payment status, customer info
- **Activity Logs:** System actions, audit trails, monitoring data

### Key Data Stores:

1. **PostgreSQL Database:**
   - Primary data persistence
   - ACID compliance for transactions
   - Relational data integrity

2. **Session Store:**
   - User authentication state
   - Temporary data cache

3. **File System:**
   - Static assets (images, documents)
   - Generated reports (PDFs)

### External Interfaces:

1. **Stripe Payment Gateway:**
   - Secure payment processing
   - PCI compliance
   - Transaction management

2. **WebSocket Connections:**
   - Real-time notifications
   - Live updates
   - Admin monitoring