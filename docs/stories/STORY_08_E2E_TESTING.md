# Story 8: End-to-End Testing
**Status**: ⏳ Pending  
**Priority**: P1 - High  
**Time Estimate**: 45 minutes  

---

## 📋 Story Overview
Perform comprehensive end-to-end testing of the entire fixture scraping and display pipeline to ensure all components work together correctly.

---

## ✅ Progress Checklist

### Pre-requisites
- [ ] All previous stories complete (1-7)
- [ ] System fully deployed

### Test Execution

- [ ] **Test 1**: FA Widget Loading
  - **URL**: https://pages.urmstontownjfc.co.uk/fa-widget.html
  - **Expected**: Widget loads with fixtures
  - **Status**: ⏳ PENDING

- [ ] **Test 2**: Manual Scrape Execution
  - **Action**: Trigger AWS Lambda manually
  - **Expected**: Returns 200, finds ~38 fixtures
  - **Status**: ⏳ PENDING

- [ ] **Test 3**: Data Flow Verification
  - **Check**: Database has new/updated fixtures
  - **Expected**: Scrape logs show success
  - **Status**: ⏳ PENDING

- [ ] **Test 4**: API Response Testing
  - **Endpoint**: /api/fixtures/get.php
  - **Expected**: Returns fixture data
  - **Status**: ⏳ PENDING

- [ ] **Test 5**: Frontend Display
  - **URL**: https://urmstontownjfc.co.uk/fixtures
  - **Expected**: Shows real fixture data
  - **Status**: ⏳ PENDING

---

## 🧪 Test Scenarios

### Scenario 1: Complete Data Pipeline
```bash
# Step 1: Check FA widget
curl -I https://pages.urmstontownjfc.co.uk/fa-widget.html
# Expected: 200 OK

# Step 2: Trigger scrape
aws lambda invoke \
  --function-name urmston-fixtures-scraper \
  --profile footballclub \
  --region eu-north-1 \
  output.json

# Check result
cat output.json | python3 -m json.tool
# Expected: "success": true, "fixturesFound": 38

# Step 3: Wait 30 seconds, then check API
curl https://pages.urmstontownjfc.co.uk/api/fixtures/get.php | jq '.stats'
# Expected: fixtures_found > 0

# Step 4: Check specific team
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get.php?team=U10" | jq '.data | length'
# Expected: > 0

# Step 5: Verify in database
# Via phpMyAdmin: SELECT COUNT(*) FROM fixtures WHERE DATE(created_at) = CURDATE();
```

### Scenario 2: Error Recovery
```bash
# Test 1: Invalid API token
curl -X POST https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php \
  -H "Authorization: Bearer INVALID" \
  -H "Content-Type: application/json" \
  -d '{"fixtures": []}'
# Expected: 403 Forbidden

# Test 2: Malformed data
curl -X POST https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php \
  -H "Authorization: Bearer ${VALID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
# Expected: 400 Bad Request

# Test 3: API endpoint down simulation
# Stop PHP service temporarily, check frontend handles gracefully
```

### Scenario 3: Performance Testing
```bash
# Test 1: API response time
time curl https://pages.urmstontownjfc.co.uk/api/fixtures/get.php > /dev/null
# Expected: < 500ms

# Test 2: Large dataset
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get.php?limit=500"
# Expected: Handles gracefully

# Test 3: Concurrent requests
for i in {1..10}; do
  curl https://pages.urmstontownjfc.co.uk/api/fixtures/get.php &
done
wait
# Expected: All complete successfully
```

### Scenario 4: Data Integrity
```sql
-- Check for duplicates
SELECT fixture_date, home_team, away_team, COUNT(*) as count
FROM fixtures
GROUP BY fixture_date, home_team, away_team
HAVING count > 1;
-- Expected: 0 rows

-- Check data freshness
SELECT MAX(updated_at) as last_update
FROM fixtures;
-- Expected: Within last 12 hours

-- Verify teams
SELECT DISTINCT age_group 
FROM fixtures 
WHERE home_team LIKE '%Urmston%' OR away_team LIKE '%Urmston%'
ORDER BY age_group;
-- Expected: U10, U11, U12, U13, U14, U15, U16
```

---

## 📊 Test Results Template

### System Health Check
| Component | Status | Notes |
|-----------|--------|-------|
| FA Widget | ⏳ | |
| AWS Lambda | ⏳ | |
| Ingestion API | ⏳ | |
| MySQL Database | ⏳ | |
| Public API | ⏳ | |
| Frontend Display | ⏳ | |

### Data Quality Metrics
| Metric | Value | Target | Pass |
|--------|-------|--------|------|
| Fixtures in DB | - | >20 | ⏳ |
| Scrape success rate | - | >95% | ⏳ |
| API response time | - | <500ms | ⏳ |
| Page load time | - | <2s | ⏳ |
| Data freshness | - | <12h | ⏳ |

### Edge Cases Tested
- [ ] Empty fixture list handling
- [ ] Network timeout recovery
- [ ] Invalid date formats
- [ ] Missing venue information
- [ ] Postponed match handling
- [ ] Score updates for completed games
- [ ] Concurrent scrape attempts
- [ ] Database connection failures

---

## 🐛 Common Issues & Solutions

### Issue 1: FA Widget Not Loading
**Symptoms**: Empty widget, no fixtures visible
**Checks**:
1. Verify league code is correct (783655865)
2. Check FA Full-Time is operational
3. Inspect browser console for errors
**Solution**: May need to update widget code if FA changes format

### Issue 2: Scraper Fails in AWS Lambda
**Symptoms**: Lambda returns error or timeout
**Checks**:
1. View CloudWatch logs: `aws logs tail /aws/lambda/urmston-fixtures-scraper --follow --profile footballclub --region eu-north-1`
2. Check environment variables are set
3. Verify Docker image is updated
**Solution**: Usually timeout or memory issues

### Issue 3: Database Not Updating
**Symptoms**: Old data shown despite successful scrape
**Checks**:
1. Check scrape_logs table
2. Verify API token matches
3. Check PHP error logs
**Solution**: Usually authentication or connection issue

### Issue 4: Frontend Shows No Data
**Symptoms**: Empty fixtures page
**Checks**:
1. Test API endpoint directly
2. Check browser network tab
3. Verify CORS headers
**Solution**: Usually API URL or CORS configuration

---

## ✅ Acceptance Criteria

| Test | Status | Notes |
|------|--------|-------|
| FA widget accessible | ⏳ | Returns 200 OK |
| Manual scrape works | ⏳ | Lambda returns 200 |
| Auto scrape works | ⏳ | Runs at scheduled times |
| Database updates | ⏳ | New fixtures added |
| API returns data | ⏳ | JSON response valid |
| Frontend displays fixtures | ⏳ | User can see fixtures |
| Filters work | ⏳ | Team/date filters functional |
| Error handling works | ⏳ | Graceful failures |
| Performance acceptable | ⏳ | <2s page load |

---

## 📝 Test Report

### Date: [To be filled]
### Tester: [To be filled]

#### Summary:
- Total tests: 9
- Passed: -
- Failed: -
- Skipped: -

#### Critical Issues:
1. [Issue description]
2. [Issue description]

#### Recommendations:
1. [Recommendation]
2. [Recommendation]

#### Sign-off:
- [ ] All critical tests passing
- [ ] Performance acceptable
- [ ] No blocking issues
- [ ] Ready for production

---

## 🚀 Post-Testing Actions

### If All Tests Pass:
1. Update README with "System Operational" badge
2. Document any configuration changes
3. Set up monitoring alerts
4. Schedule regular health checks

### If Tests Fail:
1. Document failures in issue tracker
2. Prioritize fixes by severity
3. Re-run failed tests after fixes
4. Update test cases if needed

---

## 📊 Monitoring Setup

### Recommended Monitoring:
1. **Uptime monitoring**: FA widget URL
2. **API monitoring**: Public endpoint
3. **AWS Lambda**: CloudWatch alarms on failure
4. **Database**: Scrape success rate

### Alert Thresholds:
- API response time > 1 second
- Scrape failure 2 times in a row
- No new fixtures in 24 hours
- Database connection errors

---

## ✅ Definition of Done

- [ ] All test scenarios executed
- [ ] Test results documented
- [ ] Issues logged and prioritized
- [ ] Performance benchmarks met
- [ ] Error handling verified
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] System signed off as operational

---

## 🔗 Related Links

- [All Stories](../DEVELOPMENT_STORIES.md)
- [System Architecture](../FIXTURES_SCRAPING_PRD.md#system-architecture)
- [Monitoring Dashboard](#) (TBD)