"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, RefreshCw, AlertCircle, Home } from "lucide-react"
import { getUpcomingFixtures, getRecentResults, type ApiFixture, type FixtureGroup, type ApiResponse, clearFixturesCache } from "@/lib/fixtures-api"

interface FixturesListProps {
  type: "upcoming" | "results"
  selectedTeam: string
  className?: string
}

function isFixtureGroup(fixture: ApiFixture | FixtureGroup): fixture is FixtureGroup {
  return 'fixtures' in fixture;
}

function isFixtureGroupArray(fixtures: ApiFixture[] | FixtureGroup[]): fixtures is FixtureGroup[] {
  return fixtures.length > 0 && isFixtureGroup(fixtures[0]);
}

export function FixturesListEnhanced({ type, selectedTeam, className = "" }: FixturesListProps) {
  const [fixturesData, setFixturesData] = useState<ApiFixture[] | FixtureGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGrouped, setIsGrouped] = useState(false)

  const loadFixtures = async () => {
    try {
      setLoading(true)
      setError(null)

      const team = selectedTeam === "all" ? undefined : selectedTeam

      const response: ApiResponse = type === "upcoming"
        ? await getUpcomingFixtures(team, 20)
        : await getRecentResults(team, 20)

      setFixturesData(response.fixtures)
      setIsGrouped(response.grouped_by_date || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fixtures")
      setFixturesData([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    clearFixturesCache()
    loadFixtures()
  }

  useEffect(() => {
    loadFixtures()
  }, [type, selectedTeam])

  const renderFixture = (fixture: ApiFixture, groupDate?: string) => (
    <Card key={`${groupDate || 'single'}-${fixture.id}`} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {fixture.competition}
          </Badge>
          <Badge
            variant={type === "upcoming" ? "default" : "outline"}
            className={type === "upcoming" ? "bg-[#244cbc] hover:bg-[#244cbc]/90" : ""}
          >
            {type === "upcoming" ? "Upcoming" : "Final"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Line 1: Team names and score */}
          <div className="flex items-center justify-center space-x-4 text-lg font-semibold">
            <span className="text-right flex-1">{fixture.home_team}</span>
            {type === "results" && fixture.home_score !== null && fixture.away_score !== null ? (
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded">
                <span className="text-xl font-bold">{fixture.home_score}</span>
                <span className="text-gray-500">-</span>
                <span className="text-xl font-bold">{fixture.away_score}</span>
              </div>
            ) : (
              <span className="text-gray-500 text-base">vs</span>
            )}
            <span className="text-left flex-1">{fixture.away_team}</span>
          </div>

          {/* Line 2: League || Pitch || Venue */}
          <div className="text-center text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
            <div className="flex items-center justify-center space-x-2">
              {/* League */}
              <span className="font-medium">{fixture.competition}</span>

              {/* Pitch (if available) */}
              {fixture.pitch && (
                <>
                  <span className="text-gray-400">||</span>
                  <div className="flex items-center space-x-1">
                    <Home className="h-3 w-3" />
                    <span>{fixture.pitch}</span>
                  </div>
                </>
              )}

              {/* Venue */}
              {fixture.venue && (
                <>
                  <span className="text-gray-400">||</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{fixture.venue}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Time and Date Info */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{fixture.formatted_time}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="flex justify-center space-x-6">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Failed to load fixtures</span>
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">{error}</p>
            <div className="flex justify-center">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (fixturesData.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No {type === "upcoming" ? "upcoming fixtures" : "recent results"}</p>
              <p className="text-sm">
                {selectedTeam === "all"
                  ? "Check back later for updates"
                  : `No ${type} found for ${selectedTeam}`}
              </p>
              <Button onClick={handleRefresh} variant="ghost" size="sm" className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {isGrouped && isFixtureGroupArray(fixturesData) ? (
        // Grouped by date display
        fixturesData.map((group) => (
          <div key={group.date} className="space-y-3">
            {/* Date header */}
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-[#244cbc]" />
              <h3 className="text-lg font-semibold text-[#244cbc]">{group.formatted_date}</h3>
              <div className="h-px bg-gray-200 flex-1"></div>
              <Badge variant="outline" className="text-xs">
                {group.fixtures.length} fixture{group.fixtures.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Fixtures for this date */}
            <div className="space-y-3 ml-8">
              {group.fixtures.map((fixture) => renderFixture(fixture, group.date))}
            </div>
          </div>
        ))
      ) : (
        // Regular display (fallback)
        <div className="space-y-4">
          {(fixturesData as ApiFixture[]).map((fixture) => renderFixture(fixture))}
        </div>
      )}

      {fixturesData.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button onClick={handleRefresh} variant="ghost" size="sm" className="text-gray-500">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      )}
    </div>
  )
}