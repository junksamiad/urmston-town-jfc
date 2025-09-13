# Banking Setup for Referee Payment System - Project Brief

## Executive Summary
This document consolidates all research and documentation regarding setting up a business bank account for Urmston Town JFC to enable automated referee payments via API. The club operates as an unincorporated association without formal business registration.

---

## Current Situation
- **Organization**: Urmston Town Junior Football Club (unincorporated association)
- **Need**: Business bank account with API access for automated referee payments
- **Challenge**: No formal business registration or existing constitution

---

## Research Findings

### 1. UK Legal Status - Unincorporated Associations

**Source**: GOV.UK  
**URL**: https://www.gov.uk/unincorporated-associations

**Definition**: An unincorporated association is "an organisation set up through an agreement between a group of people who come together for a reason other than to make a profit (for example, a voluntary group or a sports club)."

**Key Points**:
- Sports clubs can legally operate as unincorporated associations
- No registration required
- Can open bank accounts with proper documentation
- Committee members may have personal liability

---

### 2. Payment API Options Research

#### Wise Business API

**Documentation**: https://docs.wise.com/api-docs/  
**Developer Portal**: https://developer.revolut.com/docs/business/business-api

**✅ API Capabilities**:
- Full third-party transfer support via REST API
- Business originator details support
- Transfer tracking and webhooks
- Sandbox environment available
- Bearer token authentication

**❌ Account Access Issues**:
- Wise documentation does NOT explicitly list unincorporated associations as supported
- Supported types: sole traders, limited companies, partnerships, registered charities
- Personal accounts don't support API access
- Against terms of use for organizational finances

**Verification Attempt Sources**:
- https://wise.com/help/articles/2977974/can-my-business-use-wise
- https://wise.com/help/articles/2961337/how-do-i-open-a-wise-account-for-my-business

#### Revolut Business API

**Documentation**: https://developer.revolut.com/docs/business/business-api  
**Payment Endpoint**: https://developer.revolut.com/docs/business/create-payment

**API Features**:
- Bank transfers via `/pay` endpoint
- JWT authentication (40-minute tokens)
- Instant Revolut-to-Revolut transfers
- Idempotent requests support

**Restrictions**:
- Only available to "Business Company" plans
- PSD2 Strong Customer Authentication required
- More complex setup than Wise

---

### 3. Alternative Banking Options

#### ✅ NatWest Community Account

**URL**: https://www.natwest.com/business/bank-accounts/community-bank-account.html

**Explicitly Accepts**: Charities, clubs, religious organisations, non-personal trusts

**Features**:
- Online application available
- Free banking for organizations under £100k turnover
- "Bankline for Communities" digital platform
- Multiple signatories supported (2-4)

**Required Documentation**:
- Constitution
- Meeting minutes
- List of signatories

#### ✅ Metro Bank Community Account

**URL**: https://www.metrobankonline.co.uk/business/current-accounts/products/community-current-account/

**Explicitly Accepts**: Clubs, societies, charities

**Features**:
- 200 free transactions per month
- Turnover limit: £2m or under
- In-branch application required (Midlands/South only)

**Required Documentation**:
- Constitution documents
- Minutes of the Meeting
- Key officials details (chair/treasurer/secretary)
- Signatory information and rules

#### Other Options Mentioned in Research

**Source**: https://businessfinancing.co.uk/charity-bank-accounts/

Additional banks offering community/charity accounts:
- HSBC Charitable Bank Account
- Santander Treasurer's Account
- Various credit unions

---

## Documentation Requirements

### Standard Requirements for Unincorporated Associations

1. **Club Constitution**
   - Club name and purpose
   - Committee structure
   - Decision-making processes
   - Financial authorization rules

2. **Meeting Minutes**
   - Signed by 2+ officials
   - Authorization for account opening
   - Appointment of signatories
   - Dated and referenced

3. **Signatory Documentation**
   - List of authorized signatories
   - Signing rules (single/dual authorization)
   - Contact details for all signatories

---

## Recommended Approach

### Option 1: Traditional Bank + Manual Process
1. Open NatWest/Metro community account
2. Use online banking for manual referee payments
3. Pros: Definitely works for unincorporated associations
4. Cons: No API automation possible

### Option 2: Traditional Bank + Wise Personal Hybrid
1. Open NatWest/Metro community account for club
2. Committee member opens personal Wise account
3. Fund Wise from community account for payments
4. Pros: Gets API access
5. Cons: Personal liability, against Wise terms

### Option 3: Formalize & Apply to Wise Business
1. Create constitution and hold meeting
2. Apply to Wise Business (may be rejected)
3. If accepted, full API automation possible
4. Pros: Proper setup if accepted
5. Cons: Uncertain acceptance for unincorporated associations

### Option 4: Investigate Open Banking APIs
1. Open traditional community account
2. Research if banks offer API access (e.g., NatWest Bankline)
3. Build automation on bank's platform
4. Pros: Legitimate setup
5. Cons: Limited API capabilities vs fintech

---

## Key Sources & References

### Government & Regulatory
- GOV.UK Unincorporated Associations: https://www.gov.uk/unincorporated-associations
- Community Amateur Sports Clubs guidance: https://www.gov.uk/government/publications/community-amateur-sports-clubs-detailed-guidance-notes

### Banking Documentation
- NatWest Community Account: https://www.natwest.com/business/bank-accounts/community-bank-account.html
- Metro Bank Community Account: https://www.metrobankonline.co.uk/business/current-accounts/products/community-current-account/
- Resource Centre Banking Guide: https://www.resourcecentre.org.uk/information/bank-accounts-for-community-and-voluntary-organisations/

### API Documentation
- Wise API Docs: https://docs.wise.com/api-docs/
- Wise Platform API: https://docs.wise.com/api-docs/api-reference
- Revolut Business API: https://developer.revolut.com/docs/business/business-api
- Revolut Payment Creation: https://developer.revolut.com/docs/business/create-payment

### Community Discussions
- CharityConnect Forum: https://www.charityconnect.co.uk/post/bank-account-recommendations-for-an-unincorporated-associati/15692
- MoneySavingExpert Forum: https://forums.moneysavingexpert.com/discussion/6461004/bank-account-with-interest-for-club-unincorporated-association

---

## Documents Created

The following documents were created to support a potential Wise Business application:

1. **URMSTON_TOWN_JFC_CONSTITUTION.md** - Full club constitution template
2. **COMMITTEE_MEETING_MINUTES_TEMPLATE.md** - Meeting minutes template with banking resolutions
3. **SIGNATORY_AUTHORIZATION.md** - Banking authorization and signatory documentation
4. **STORY_06_WISE_BUSINESS_SETUP.md** - User story for implementation process

All documents are stored in the `/banking-issue/` directory for future reference.

---

## Next Steps When Ready

1. **Verify with Wise directly** - Contact support to confirm if they accept unincorporated sports clubs
2. **Consider traditional banks** - NatWest/Metro definitely accept sports clubs
3. **Explore Open Banking** - Research if traditional banks offer suitable APIs
4. **Legal structure review** - Consider if formalizing as a CIC or charity would help

---

## Conclusion

While the technical implementation of automated referee payments is feasible, the primary challenge is obtaining a business bank account with API access for an unincorporated association. Traditional banks clearly support sports clubs but may lack API capabilities. Fintech solutions like Wise offer excellent APIs but may not accept unincorporated associations. 

This requires either:
- Accepting manual payment processes with traditional banking
- Formalizing the club's legal structure
- Finding creative (but compliant) workarounds

---

*Document compiled: [Current Date]*  
*Status: On hold pending club decision on approach*