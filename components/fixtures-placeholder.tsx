"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from "lucide-react"

interface FixturesPlaceholderProps {
  teamType: "upcoming" | "results"
  className?: string
}

interface BaseFixture {
  date: string
  time: string
  homeTeam: string
  awayTeam: string
  venue: string
  league: string
  status: string
}

interface UpcomingFixture extends BaseFixture {
  status: "upcoming"
}

interface ResultFixture extends BaseFixture {
  status: "result"
  homeScore: number
  awayScore: number
}

type Fixture = UpcomingFixture | ResultFixture

export function FixturesPlaceholder({ teamType, className = "" }: FixturesPlaceholderProps) {
  const upcomingFixtures: UpcomingFixture[] = [
    {
      date: "Sun, 14 Sept 2025",
      time: "10:30",
      homeTeam: "Urmston Town U10s",
      awayTeam: "Sale United U10s",
      venue: "Abbotsfield Park",
      league: "Greater Manchester Youth League",
      status: "upcoming"
    },
    {
      date: "Sun, 14 Sept 2025", 
      time: "14:00",
      homeTeam: "Urmston Town U12s",
      awayTeam: "Stretford Paddock U12s",
      venue: "Abbotsfield Park",
      league: "Greater Manchester Youth League",
      status: "upcoming"
    }
  ]

  const recentResults: ResultFixture[] = [
    {
      date: "Sun, 7 Sept 2025",
      time: "10:30", 
      homeTeam: "Urmston Town U11s",
      awayTeam: "Altrincham FC U11s",
      venue: "Moss Lane",
      league: "Greater Manchester Youth League",
      homeScore: 2,
      awayScore: 1,
      status: "result"
    },
    {
      date: "Sun, 7 Sept 2025",
      time: "14:00",
      homeTeam: "Sale FC U13s", 
      awayTeam: "Urmston Town U13s",
      venue: "Sale Sports Club",
      league: "Greater Manchester Youth League", 
      homeScore: 1,
      awayScore: 3,
      status: "result"
    }
  ]

  const fixtures: Fixture[] = teamType === "upcoming" ? upcomingFixtures : recentResults

  return (
    <div className={`space-y-4 ${className}`}>
      {fixtures.map((fixture, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {fixture.league}
              </Badge>
              <Badge 
                variant={fixture.status === "upcoming" ? "default" : "outline"}
                className={fixture.status === "upcoming" ? "bg-[#244cbc] hover:bg-[#244cbc]/90" : ""}
              >
                {fixture.status === "upcoming" ? "Upcoming" : "Final"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Match Details */}
              <div className="flex items-center justify-center space-x-4 text-lg font-semibold">
                <span className="text-right flex-1">{fixture.homeTeam}</span>
                {fixture.status === "result" ? (
                  <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded">
                    <span className="text-xl font-bold">{(fixture as ResultFixture).homeScore}</span>
                    <span className="text-gray-500">-</span>
                    <span className="text-xl font-bold">{(fixture as ResultFixture).awayScore}</span>
                  </div>
                ) : (
                  <span className="text-gray-500 text-base">vs</span>
                )}
                <span className="text-left flex-1">{fixture.awayTeam}</span>
              </div>

              {/* Match Info */}
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{fixture.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{fixture.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{fixture.venue}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}