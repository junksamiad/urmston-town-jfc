"use client"

import { useState, useEffect } from "react"
import { ClubHeader } from "@/components/club-navigation"
import { FixturesList } from "@/components/fixtures-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUpcomingFixtures, getRecentResults } from "@/lib/fixtures-api"

export default function FixturesPage() {
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [upcomingCount, setUpcomingCount] = useState(0)
  const [resultsCount, setResultsCount] = useState(0)

  // Load fixture counts for tab labels
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const team = selectedTeam === "all" ? undefined : selectedTeam

        const [upcomingResponse, resultsResponse] = await Promise.all([
          getUpcomingFixtures(team, 100),
          getRecentResults(team, 100)
        ])

        setUpcomingCount(upcomingResponse.fixtures.length)
        setResultsCount(resultsResponse.fixtures.length)
      } catch (error) {
        console.error("Failed to load fixture counts:", error)
      }
    }

    loadCounts()
  }, [selectedTeam])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <ClubHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Team Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter by Team</CardTitle>
            <CardDescription>View fixtures for specific age groups</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                <SelectItem value="U7">Under 7s</SelectItem>
                <SelectItem value="U8">Under 8s</SelectItem>
                <SelectItem value="U9">Under 9s</SelectItem>
                <SelectItem value="U10">Under 10s</SelectItem>
                <SelectItem value="U12">Under 12s</SelectItem>
                <SelectItem value="U13">Under 13s</SelectItem>
                <SelectItem value="U15">Under 15s</SelectItem>
                <SelectItem value="U16">Under 16s</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Fixtures and Results Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="upcoming">
              Upcoming Fixtures {upcomingCount > 0 && `(${upcomingCount})`}
            </TabsTrigger>
            <TabsTrigger value="results">
              Results {resultsCount > 0 && `(${resultsCount})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <FixturesList type="upcoming" selectedTeam={selectedTeam} />
          </TabsContent>

          <TabsContent value="results">
            <FixturesList type="results" selectedTeam={selectedTeam} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}