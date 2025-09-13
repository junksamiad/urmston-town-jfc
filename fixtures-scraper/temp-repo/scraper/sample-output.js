// Sample output showing exactly what the scraper will send to the API

// Raw fixture data from scraper (before transformation)
const rawTimperleyFixture = {
  date: 'Sat 13 Sep 2025 09:30',
  time: '09:30',
  home_team: 'Ashton On Mersey FC U10 Mars',
  away_team: 'Urmston Town Juniors U10 Leopards',
  venue: 'WELLFIELD JUNIOR SCHOOL P1',
  league: 'Timperley & District JFL',
  fixture_type: 'D',
  home_score: null,
  away_score: null
};

const rawSalfordFixture = {
  date: 'Sat 13 Sep 2025 09:30',
  time: '09:30',
  home_team: 'Urmston Town Juniors U13 Phoenix',
  away_team: 'Deans Youth & Ladies U13 Sports',
  venue: 'BARTON CLOUGH PLAYING FIELDS Pitch 1 09.30am',
  league: 'Salford League',
  fixture_type: null,
  home_score: null,
  away_score: null
};

// Final API payload (after transformation)
const apiPayload = {
  fixtures: [
    // Timperley fixture
    {
      date: '2025-09-13 09:30:00',
      home_team: 'Ashton On Mersey FC U10 Mars',
      away_team: 'Urmston Town Juniors U10 Leopards',
      venue: 'WELLFIELD JUNIOR SCHOOL P1',
      league: 'Timperley & District JFL',
      home_score: null,
      away_score: null,
      status: 'upcoming',
      age_group: 'U10',
      fixture_type: 'D',
      raw_data: JSON.stringify(rawTimperleyFixture)
    },
    // Salford fixture
    {
      date: '2025-09-13 09:30:00',
      home_team: 'Urmston Town Juniors U13 Phoenix',
      away_team: 'Deans Youth & Ladies U13 Sports',
      venue: 'BARTON CLOUGH PLAYING FIELDS Pitch 1 09.30am',
      league: 'Salford League',
      home_score: null,
      away_score: null,
      status: 'upcoming',
      age_group: 'U13',
      fixture_type: null,
      raw_data: JSON.stringify(rawSalfordFixture)
    }
  ],
  source: 'playwright-scraper',
  timestamp: '2025-09-12T20:55:00.000Z'
};

console.log('FINAL API PAYLOAD:');
console.log('==================');
console.log(JSON.stringify(apiPayload, null, 2));