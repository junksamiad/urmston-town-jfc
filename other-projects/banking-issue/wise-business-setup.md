# Story 06: Wise Business Account Setup for Referee Payment System

## User Story
**As a** committee member of Urmston Town JFC  
**I want to** set up a Wise Business account with proper documentation  
**So that** we can automate referee payments through our web application

## Background
Urmston Town JFC currently operates as an informal sports club without formal business registration. To implement the automated referee payment system, we need a Wise Business account that supports API access for programmatic payments.

## Problem Statement
- Club lacks formal documentation required for business banking
- Personal accounts don't support API access needed for automation
- Need proper organizational structure for financial accountability
- Must comply with Wise Business account requirements

## Solution Overview
Formalize the club's structure with minimal documentation to qualify for Wise Business account, enabling API-driven automated payments.

## Acceptance Criteria

### AC1: Club Constitution Created
**Given** the club needs formal documentation  
**When** we create a club constitution  
**Then** it must include:
- [ ] Club name: "Urmston Town Junior Football Club"
- [ ] Club purpose: Youth football development and match organization
- [ ] Committee structure (Chair, Secretary, Treasurer minimum)
- [ ] Decision-making process for financial matters
- [ ] Signatory authorization rules
- [ ] Meeting requirements
- [ ] Constitution date and version

### AC2: Committee Meeting Conducted
**Given** we need official meeting minutes  
**When** we hold a committee meeting  
**Then** we must:
- [ ] Have 2+ committee members present
- [ ] Document attendees with roles
- [ ] Record decisions about:
  - Wise account setup authorization
  - Signatory appointments
  - Referee payment system approval
- [ ] Get signatures from 2+ officials (Chair/Secretary/Treasurer)
- [ ] Date and reference the meeting

### AC3: Signatory Details Documented
**Given** Wise needs signatory information  
**When** we define account permissions  
**Then** we must specify:
- [ ] Primary signatories (who can authorize payments)
- [ ] Signing rules (single/dual authorization requirements)
- [ ] API access permissions (who can manage)
- [ ] Committee member contact details
- [ ] Authority levels for different transaction amounts

### AC4: Wise Account Application Prepared
**Given** we have all required documentation  
**When** we prepare the Wise application  
**Then** we must have:
- [ ] Signed club constitution
- [ ] Signed meeting minutes
- [ ] Signatory authorization document
- [ ] Club registration address
- [ ] Committee member identification documents
- [ ] Recent financial records (if available)

## Implementation Steps

### Phase 1: Documentation Preparation (1-2 hours)
1. **Draft Club Constitution**
   - Use simple template format
   - Include minimum required elements
   - Keep concise (1-2 pages maximum)

2. **Schedule Committee Meeting**
   - Invite Chair, Secretary, Treasurer (minimum)
   - Prepare agenda covering Wise account setup
   - Book venue/time for official meeting

### Phase 2: Official Meeting (30-60 minutes)
1. **Conduct Committee Meeting**
   - Follow agenda structure
   - Record all decisions formally
   - Get required signatures on minutes
   - Photograph/scan signed documents

2. **Create Signatory Documentation**
   - List authorized signatories
   - Define spending limits and authorization rules
   - Document API access permissions

### Phase 3: Wise Application (1-2 days)
1. **Complete Online Application**
   - Access Wise Business account setup
   - Upload required documents
   - Provide committee member details

2. **Await Verification**
   - Respond to any Wise queries promptly
   - Provide additional documentation if requested
   - Expected timeframe: 1-10 days

### Phase 4: API Setup (30 minutes)
1. **Enable API Access**
   - Set up 2-step verification
   - Generate API tokens
   - Test API connectivity

2. **Configure Multi-User Access**
   - Add committee members as users
   - Set appropriate permissions
   - Test payment authorization workflow

## Success Metrics
- [ ] Wise Business account successfully opened
- [ ] API access enabled and functional
- [ ] Committee members have appropriate access levels
- [ ] Test payment can be initiated via API
- [ ] Account ready for referee payment system integration

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|---------|------------|
| Wise rejects application | High | Ensure all documentation is complete and accurate |
| Committee availability | Medium | Schedule meeting well in advance |
| Missing documentation | Medium | Create checklist and review before submission |
| API access issues | High | Complete 2-step verification setup immediately |

## Dependencies
- Committee member availability for meeting
- Access to club's operational address
- Committee member identification documents
- Any existing club financial records

## Definition of Done
- Wise Business account is active and verified
- API tokens generated and tested
- Multi-user access configured for committee members
- Documentation stored securely for future reference
- Account ready for referee payment system integration

## Next Steps
After completion, this enables:
- Integration with referee payment web application
- Automated payment processing via Wise API
- Committee approval workflow implementation
- Full deployment of Project 3: Referee Payments Web App