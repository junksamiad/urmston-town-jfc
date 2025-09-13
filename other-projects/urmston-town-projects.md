# Urmston Town Projects

This document outlines web solutions to complement the main Urmston Town website hosted on Hostinger.

## Project 1: Fixtures Page and Pitch Clash Alerts
*Currently in development at: `/fixtures-scraper`*

A system to manage fixtures and alert on pitch scheduling conflicts.

## Project 2: Admin Dashboard
An admin dashboard accessible via admin login link in the main page navigation bar.

## Project 3: Referee Payments Web App
A web application for managing referee payments.

### System Architecture
- **Frontend**: `ref-fees.urmstontownjfc.co.uk` (subdomain hosted on Hostinger)
- **Main Site Integration**: "Ref-Fees" link in navigation bar (no login required)
- **Backend**: Payment processing system with committee approval workflow
- **Payment Provider**: Revolut/Wise Business virtual card integration

### User Flow
1. **Manager Access**: Clicks "Ref-Fees" link from main site navigation
2. **Payment Request**: Fills form with:
   - Referee name
   - Fee amount
   - Account details (sort code, account number)
   - Manager name
3. **Request Submission**: Form submits to backend system
4. **Committee Notification**: System alerts committee members for approval
5. **Authorization**: Committee member approves/rejects payment
6. **Payment Processing**: Approved requests trigger Revolut/Wise API payment
7. **Confirmation**: Payment status updated and parties notified

### Technical Requirements
- Form validation and spam protection
- Committee notification system (email alerts)
- Payment status tracking and audit trail
- Revolut/Wise Business API integration
- Secure handling of banking details

### Benefits
- Simple access for all managers (no authentication barriers)
- Clear approval workflow with audit trail
- Automated payment processing
- Scalable system for adding/removing managers

### API Research Findings

#### Wise Business API ✅ FEASIBLE
- **Payment Capabilities**: Full third-party transfer support via REST API
- **Business Integration**: Supports business originator details and registration codes
- **Transfer Types**: Bank transfers, SWIFT payments, domestic/international
- **Authentication**: Bearer token with API key setup
- **Documentation**: Comprehensive with code examples and sandbox environment
- **Key Features**:
  - Create transfers with business originator information
  - Multiple funding methods (bank transfer, card)
  - Transfer tracking and status updates
  - Webhook support for notifications
- **Requirements**: Wise Business account + API access approval

#### Revolut Business API ⚠️ RESTRICTED ACCESS
- **Payment Capabilities**: Bank transfers via `/pay` endpoint
- **Access Restriction**: Only available to "Business Company" plans (not freelancers)
- **Authentication**: JWT tokens (40-minute expiration) + Strong Customer Authentication
- **Transfer Support**: External bank accounts + internal Revolut accounts
- **Key Features**:
  - Instant transfers between Revolut accounts
  - Idempotent requests via unique request IDs
  - Transfer reason codes for compliance
- **Limitations**: PSD2 Strong Customer Authentication requirements

### Feasibility Assessment
**✅ TECHNICALLY FEASIBLE** - Both providers offer payment APIs suitable for automated referee payments.

**Recommended Approach**: 
1. **Primary**: Wise Business API (more accessible, better documentation)
2. **Alternative**: Revolut Business API (if club qualifies for Company plan)

### Account Setup Research

#### Wise Business Account Setup for Unincorporated Sports Clubs

**✅ URMSTON TOWN CAN QUALIFY** - Wise supports unincorporated associations including sports clubs.

**Required Documentation:**
- **Constitution/Governing Document**: Club constitution or formal agreement
- **Meeting Minutes**: Signed by 2+ key officials (chair/treasurer/secretary) 
- **Signatory Details**: Who can sign for the account + signing rules
- **Beneficial Ownership**: List of anyone with 25%+ control/ownership
- **Financial Records**: Recent bank statements/income proof (6-12 months)
- **Registration Address**: Club's legal/operational address

**Setup Process:**
- Online application via Wise website/app
- Verification: 1-10 days (usually 1-2 days)
- One-time opening fee (no monthly costs)
- 2-step verification required for API access

**⚠️ Personal Account Alternative NOT SUITABLE**
- Personal accounts don't support:
  - Open API access (required for automation)
  - Multi-user permissions 
  - Business payment terms
- Against Wise terms of use for organizational finances

#### Committee Member Workaround
**If club lacks proper documentation**: A committee member could open a Wise Business account as a sole trader/individual business, but this creates legal/liability issues and isn't recommended for club finances.

**Recommended Path**: Formalize club structure with basic constitution and meeting minutes to qualify for proper business account.

### Remaining Research
- Hostinger subdomain setup and file management
- Security considerations for handling banking data
- Committee approval notification methods
- Cost comparison: API fees vs manual processing
- Club constitution template and meeting minutes requirements