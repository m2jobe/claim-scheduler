"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Star,
  Trophy,
  Zap,
  Users,
  TrendingUp,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Filter,
  Search,
  BarChart3,
} from "lucide-react";

export default function RadimalScheduler() {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [currentUserPoints, setCurrentUserPoints] = useState(2840);
  const [pendingPoints, setPendingPoints] = useState(150);
  const [showHistory, setShowHistory] = useState(false);
  const [confirmingSlot, setConfirmingSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [showTooltip, setShowTooltip] = useState(null);
  const [animatingCards, setAnimatingCards] = useState(false);

  const weeks = [
    { label: "This Week", dates: "Jun 29 - Jul 5" },
    { label: "Next Week", dates: "Jul 6 - Jul 12" },
  ];

  const vets = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      specialty: "Orthopedic",
      level: "Gold",
      points: 2840,
      avatar: "SC",
      responseTime: "12 min avg",
      streak: 15,
      thisWeek: 18,
      isCurrentUser: true,
      onLeaderboard: true,
      trend: "+12%",
    },
    {
      id: 2,
      name: "Dr. Mike Rodriguez",
      specialty: "Cardiac",
      level: "Silver",
      points: 1950,
      avatar: "MR",
      responseTime: "18 min avg",
      streak: 8,
      thisWeek: 12,
      isCurrentUser: false,
      onLeaderboard: true,
      trend: "+5%",
    },
    {
      id: 3,
      name: "Dr. Emma Wilson",
      specialty: "Neurological",
      level: "Platinum",
      points: 4200,
      avatar: "EW",
      responseTime: "8 min avg",
      streak: 23,
      thisWeek: 25,
      isCurrentUser: false,
      onLeaderboard: true,
      trend: "+18%",
    },
  ];

  const pastShifts = [
    {
      date: "Jun 30",
      time: "2:00 PM",
      status: "completed",
      points: 50,
      cases: 3,
    },
    {
      date: "Jun 29",
      time: "10:00 AM",
      status: "no-show",
      points: -200,
      cases: 0,
    },
    {
      date: "Jun 20",
      time: "2:00 PM",
      status: "completed",
      points: 50,
      cases: 5,
    },
    {
      date: "Jun 19",
      time: "10:00 AM",
      status: "completed",
      points: 50,
      cases: 2,
    },
    {
      date: "Jun 18",
      time: "3:00 PM",
      status: "no-show",
      points: -200,
      cases: 0,
    },
    {
      date: "Jun 17",
      time: "1:00 PM",
      status: "completed",
      points: 50,
      cases: 4,
    },
  ];

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const generateSchedule = (weekIndex = 0) => {
    const schedule = {};
    const baseDates =
      weekIndex === 0
        ? ["Jun 29", "Jun 30", "Jul 1", "Jul 2", "Jul 3", "Jul 4", "Jul 5"]
        : ["Jul 6", "Jul 7", "Jul 8", "Jul 9", "Jul 10", "Jul 11", "Jul 12"];

    weekDays.forEach((day, dayIndex) => {
      schedule[day] = timeSlots.map((time, timeIndex) => {
        // Only show historical data for the first week (current week)
        const isNoShowSlot =
          weekIndex === 0 && day === "Thu" && time === "3:00 PM";
        const isMissedSlot =
          weekIndex === 0 && day === "Mon" && time === "10:00 AM";
        const isCompletedSlot =
          weekIndex === 0 && day === "Tue" && time === "2:00 PM";
        // Show emergency slot on different days for different weeks
        const isLastMinuteSlot =
          (weekIndex === 0 && day === "Fri" && time === "11:00 AM") ||
          (weekIndex === 1 && day === "Wed" && time === "2:00 PM");

        // Use deterministic values based on day/time indices and week for consistent patterns
        const seed = weekIndex * 100 + dayIndex * 10 + timeIndex;
        const randomClaimed = seed % 7 > 4; // ~30% claimed
        const randomVetId = seed % 3 === 0 ? vets[seed % vets.length].id : null;

        return {
          time,
          date: baseDates[dayIndex],
          available: true,
          vetId:
            isMissedSlot || isCompletedSlot
              ? 1
              : randomClaimed && !isLastMinuteSlot
                ? randomVetId
                : null,
          claimed:
            (randomClaimed || isMissedSlot || isCompletedSlot) &&
            !isLastMinuteSlot,
          isNoShow: isNoShowSlot,
          isMissed: isMissedSlot,
          isCompleted: isCompletedSlot,
          isLastMinute: isLastMinuteSlot,
          claimedBy:
            randomClaimed &&
            !isMissedSlot &&
            !isCompletedSlot &&
            !isLastMinuteSlot
              ? "Dr. Anonymous"
              : null,
          estimatedCases: (seed % 5) + 1,
        };
      });
    });
    return schedule;
  };

  const [schedule, setSchedule] = useState(() => generateSchedule(0));

  useEffect(() => {
    setAnimatingCards(true);
    setSchedule(generateSchedule(selectedWeek));
    const timer = setTimeout(() => setAnimatingCards(false), 100);
    return () => clearTimeout(timer);
  }, [selectedWeek]);

  const claimSlot = async (day, timeIndex) => {
    const slot = schedule[day][timeIndex];
    const currentDate = new Date("July 3, 2024");
    const slotDate = new Date(slot.date + ", 2024");
    const isPastDate = slotDate < currentDate;

    if (slot.claimed && slot.vetId === 1) {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newSchedule = { ...schedule };
      newSchedule[day][timeIndex].claimed = false;
      newSchedule[day][timeIndex].vetId = null;
      setSchedule(newSchedule);
      const pointChange = slot.isLastMinute ? -200 : -50;
      setPendingPoints((prev) => prev + pointChange);
      setLoading(false);
    } else if (!slot.claimed && (!isPastDate || slot.isLastMinute)) {
      setConfirmingSlot({
        day,
        timeIndex,
        time: timeSlots[timeIndex],
        date: slot.date,
        isLastMinute: slot.isLastMinute,
        estimatedCases: slot.estimatedCases,
      });
    }
  };

  const confirmClaim = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const { day, timeIndex, isLastMinute } = confirmingSlot;
    const newSchedule = { ...schedule };
    newSchedule[day][timeIndex].claimed = true;
    newSchedule[day][timeIndex].vetId = 1;
    newSchedule[day][timeIndex].status = "pending";
    setSchedule(newSchedule);
    const pointChange = isLastMinute ? 200 : 50;
    setPendingPoints((prev) => prev + pointChange);
    setConfirmingSlot(null);
    setLoading(false);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "Platinum":
        return "bg-gradient-to-r from-indigo-500 to-purple-600";
      case "Gold":
        return "bg-gradient-to-r from-amber-400 to-yellow-500";
      case "Silver":
        return "bg-gradient-to-r from-slate-400 to-slate-500";
      default:
        return "bg-gradient-to-r from-teal-500 to-blue-500";
    }
  };

  const filteredVets = vets.filter((vet) => {
    const matchesSearch =
      vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel =
      filterLevel === "all" || vet.level.toLowerCase() === filterLevel;
    return matchesSearch && matchesLevel && vet.onLeaderboard;
  });

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-8 bg-slate-200 rounded w-16"></div>
          <div className="h-3 bg-slate-200 rounded w-24"></div>
        </div>
        <div className="p-3 bg-slate-100 rounded-lg">
          <div className="h-6 w-6 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  const Tooltip = ({ content, children, id }) => (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(id)}
      onMouseLeave={() => setShowTooltip(null)}
    >
      {children}
      {showTooltip === id && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
            {content}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg px-6 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            <span className="text-slate-700 font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                Radimal Scheduler
              </h1>
              <p className="text-slate-600 text-sm lg:text-base">
                Claim shifts, earn points, build your reputation
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all duration-200 hover:scale-105"
              >
                {showHistory ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {showHistory ? "Hide History" : "View History"}
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-teal-700 hover:to-blue-700 transition-all duration-200 hover:scale-105 shadow-sm">
                <Trophy className="h-4 w-4" />
                Convert Points
              </button>

              <div className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-blue-50 px-4 py-2 rounded-lg border border-teal-100 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-bold flex items-center justify-center shadow-sm">
                  SC
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    Dr. Sarah Chen
                  </p>
                  <p className="text-xs text-slate-600">
                    Orthopedic Specialist
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array(4)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <div
                className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animatingCards ? "animate-in slide-in-from-bottom-4 duration-500" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      This Week
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mt-1">
                      23
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Cases reviewed
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">
                        +12% vs last week
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl">
                    <Users className="h-6 w-6 text-teal-600" />
                  </div>
                </div>
              </div>

              <div
                className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animatingCards ? "animate-in slide-in-from-bottom-4 duration-500 delay-100" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Active Streak
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mt-1">
                      15
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Days in a row</p>
                    <Tooltip
                      content="Consecutive days with completed shifts"
                      id="streak"
                    >
                      <div className="flex items-center gap-1 mt-2 cursor-help">
                        <Zap className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-orange-600 font-medium">
                          On fire!
                        </span>
                      </div>
                    </Tooltip>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                    <Zap className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </div>

              <div
                className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animatingCards ? "animate-in slide-in-from-bottom-4 duration-500 delay-200" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Total Points
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mt-1">
                      {currentUserPoints.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Gold tier</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl">
                    <Trophy className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                {pendingPoints > 0 && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-amber-600" />
                      <p className="text-xs font-medium text-amber-700">
                        +{pendingPoints} pending
                      </p>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">
                      Awaiting verification
                    </p>
                  </div>
                )}
              </div>

              <div
                className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animatingCards ? "animate-in slide-in-from-bottom-4 duration-500 delay-300" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Avg Response
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-1">
                      12m
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Response time</p>
                    <div className="flex items-center gap-1 mt-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">
                        Excellent
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                    <Clock className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Point System Info */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 border border-blue-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-2">
                Point System
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                  <span className="text-slate-700">
                    Completed shifts +50pts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <span className="text-slate-700">No-shows -200pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-orange-600" />
                  <span className="text-slate-700">
                    Emergency coverage +200pts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-amber-600" />
                  <span className="text-slate-700">
                    24hr+ cancellation -25pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Shift History
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BarChart3 className="h-4 w-4" />
                  <span>Last 30 days</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              {pastShifts.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No shift history yet</p>
                  <p className="text-sm text-slate-400">
                    Your completed shifts will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastShifts.map((shift, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-[1.02] group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            shift.status === "completed"
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          } group-hover:scale-110 transition-transform`}
                        ></div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {shift.date} at {shift.time}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <span className="capitalize">
                              {shift.status.replace("-", " ")}
                            </span>
                            {shift.cases > 0 && (
                              <span>• {shift.cases} cases</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${shift.points > 0 ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {shift.points > 0 ? "+" : ""}
                          {shift.points} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Weekly Leaders
                </h2>
                <span className="text-sm text-slate-500">
                  (Opt-in leaderboard)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search vets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredVets.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No vets found</p>
                <p className="text-sm text-slate-400">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVets.map((vet, index) => (
                  <div
                    key={vet.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-[1.02] group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-slate-400 w-6">
                          #{index + 1}
                        </span>
                        <div
                          className={`w-10 h-10 rounded-full ${getLevelColor(vet.level)} text-white text-sm font-bold flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
                        >
                          {vet.avatar}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {vet.name}{" "}
                          {vet.isCurrentUser && (
                            <span className="text-teal-600">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-slate-600">
                          {vet.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {vet.thisWeek} cases
                        </p>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-slate-500">
                            {vet.responseTime}
                          </span>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-green-600">{vet.trend}</span>
                        </div>
                      </div>
                      <Tooltip
                        content={`${vet.streak} consecutive active days`}
                        id={`streak-${vet.id}`}
                      >
                        <div className="flex items-center gap-1 cursor-help">
                          <Zap className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-bold text-orange-600">
                            {vet.streak}
                          </span>
                        </div>
                      </Tooltip>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getLevelColor(vet.level)} shadow-sm`}
                      >
                        {vet.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Available Shifts
                </h2>
              </div>
              <div className="flex gap-2">
                {weeks.map((week, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedWeek(index)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedWeek === index
                        ? "bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-sm scale-105"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:scale-105"
                    }`}
                  >
                    <div className="text-center">
                      <div>{week.label}</div>
                      <div className="text-xs opacity-75">{week.dates}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 gap-2 min-w-[800px]">
                {/* Header */}
                <div className="p-3 font-semibold text-slate-600 text-sm bg-slate-50 rounded-lg w-20">
                  Time
                </div>
                {weekDays.map((day, index) => (
                  <div
                    key={day}
                    className="p-3 font-semibold text-slate-600 text-center text-sm bg-slate-50 rounded-lg w-24"
                  >
                    <div>{day}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {schedule[day][0]?.date}
                    </div>
                  </div>
                ))}

                {/* Time slots */}
                {timeSlots.map((time, timeIndex) => (
                  <React.Fragment key={time}>
                    <div className="p-3 text-sm text-slate-600 font-medium bg-slate-50 rounded-lg flex items-center w-20">
                      {time}
                    </div>
                    {weekDays.map((day) => {
                      const slot = schedule[day][timeIndex];
                      const currentDate = new Date("July 3, 2024");
                      const slotDate = new Date(slot.date + ", 2024");
                      const isPastDate = slotDate < currentDate;

                      return (
                        <div key={`${day}-${time}`} className="p-1 w-24">
                          {slot.available ? (
                            <Tooltip
                              content={
                                slot.isMissed
                                  ? "Missed shift - penalty applied"
                                  : slot.isCompleted
                                    ? "Completed shift - points earned"
                                    : slot.isNoShow
                                      ? "No-show - penalty applied"
                                      : slot.isLastMinute
                                        ? `Emergency coverage needed - ${slot.estimatedCases} estimated cases`
                                        : slot.claimed && slot.vetId === 1
                                          ? "Your claimed shift - click to unclaim"
                                          : slot.claimed
                                            ? `Claimed by ${slot.claimedBy || "another vet"}`
                                            : isPastDate
                                              ? "Past time slot"
                                              : `Available shift - ${slot.estimatedCases} estimated cases`
                              }
                              id={`slot-${day}-${timeIndex}`}
                            >
                              <button
                                className={`w-24 h-20 rounded-xl transition-all duration-300 text-xs font-medium border-2 group relative overflow-hidden flex flex-col items-center justify-center ${
                                  slot.isMissed
                                    ? "bg-gradient-to-br from-red-50 to-red-100 text-red-700 border-red-200 hover:from-red-100 hover:to-red-150"
                                    : slot.isCompleted
                                      ? "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-emerald-150"
                                      : slot.isNoShow
                                        ? "bg-gradient-to-br from-red-50 to-red-100 text-red-700 border-red-200"
                                        : slot.isLastMinute
                                          ? "bg-gradient-to-br from-orange-50 to-yellow-50 text-orange-700 border-orange-200 hover:from-orange-100 hover:to-yellow-100 shadow-lg hover:shadow-xl hover:scale-105"
                                          : slot.claimed && slot.vetId === 1
                                            ? "bg-gradient-to-br from-teal-50 to-blue-50 text-teal-700 border-teal-200 hover:from-teal-100 hover:to-blue-100 shadow-md hover:shadow-lg hover:scale-105"
                                            : slot.claimed
                                              ? "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                              : isPastDate
                                                ? "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400 border-slate-150 cursor-not-allowed"
                                                : "bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 shadow-md hover:shadow-lg hover:scale-105"
                                }`}
                                onClick={() =>
                                  !slot.isNoShow &&
                                  !slot.isMissed &&
                                  !slot.isCompleted &&
                                  claimSlot(day, timeIndex)
                                }
                                disabled={
                                  (slot.claimed && slot.vetId !== 1) ||
                                  slot.isNoShow ||
                                  slot.isMissed ||
                                  slot.isCompleted ||
                                  (!slot.claimed &&
                                    !slot.isLastMinute &&
                                    isPastDate)
                                }
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:animate-pulse"></div>
                                <div className="flex flex-col items-center justify-center h-full w-full px-1">
                                  {slot.isMissed ? (
                                    <>
                                      <AlertCircle className="h-3 w-3 mb-1 flex-shrink-0" />
                                      <span className="text-xs leading-tight">
                                        Missed
                                      </span>
                                      <span className="text-xs font-bold leading-tight">
                                        -200
                                      </span>
                                    </>
                                  ) : slot.isCompleted ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mb-1 flex-shrink-0" />
                                      <span className="text-xs leading-tight">
                                        Done
                                      </span>
                                      <span className="text-xs font-bold leading-tight">
                                        +50
                                      </span>
                                    </>
                                  ) : slot.isNoShow ? (
                                    <>
                                      <AlertCircle className="h-3 w-3 mb-1 flex-shrink-0" />
                                      <span className="text-xs leading-tight">
                                        No-show
                                      </span>
                                    </>
                                  ) : slot.isLastMinute ? (
                                    <>
                                      <Zap className="h-4 w-4 mb-1 animate-pulse flex-shrink-0" />
                                      <span className="text-xs font-bold leading-tight">
                                        Emergency
                                      </span>
                                      <span className="text-xs font-bold text-orange-600 leading-tight">
                                        +200
                                      </span>
                                    </>
                                  ) : slot.claimed && slot.vetId === 1 ? (
                                    <>
                                      <Star className="h-3 w-3 mb-1 flex-shrink-0" />
                                      <span className="text-xs leading-tight text-center">
                                        Yours
                                      </span>
                                      <span className="text-xs leading-tight text-center">
                                        Unclaim
                                      </span>
                                    </>
                                  ) : slot.claimed ? (
                                    <>
                                      <Users className="h-3 w-3 mb-1 flex-shrink-0" />
                                      <span className="text-xs leading-tight">
                                        Claimed
                                      </span>
                                    </>
                                  ) : isPastDate ? (
                                    <>
                                      <span className="text-xs leading-tight">
                                        Past
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-xs mb-1 leading-tight">
                                        Available
                                      </span>
                                      <span className="text-xs font-bold text-blue-600 leading-tight">
                                        +50 pts
                                      </span>
                                      <span className="text-xs text-slate-500 leading-tight">
                                        ~{slot.estimatedCases} cases
                                      </span>
                                    </>
                                  )}
                                </div>
                              </button>
                            </Tooltip>
                          ) : (
                            <div className="w-full h-16 bg-slate-100 rounded-xl"></div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Enhanced Legend */}
            <div className="mt-6 bg-slate-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Shift Status Legend
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded"></div>
                  <span className="text-slate-600">Available (+50 pts)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded"></div>
                  <span className="text-slate-600">Emergency (+200 pts)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200 rounded"></div>
                  <span className="text-slate-600">Your claims</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded"></div>
                  <span className="text-slate-600">Completed (+50 pts)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded"></div>
                  <span className="text-slate-600">Claimed by others</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded"></div>
                  <span className="text-slate-600">
                    Missed/No-show (-200 pts)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Confirmation Modal */}
      {confirmingSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {confirmingSlot.isLastMinute ? (
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="h-5 w-5 text-orange-600" />
                  </div>
                ) : (
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-teal-600" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900">
                  {confirmingSlot.isLastMinute
                    ? "⚡ Emergency Coverage"
                    : "Confirm Shift"}
                </h3>
              </div>

              <div className="mb-4">
                <p className="text-slate-600 mb-2">
                  Claim {confirmingSlot.day} {confirmingSlot.date} at{" "}
                  {confirmingSlot.time}?
                </p>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Estimated cases:</span>
                    <span className="font-medium text-slate-900">
                      {confirmingSlot.estimatedCases}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-600">Points earned:</span>
                    <span className="font-medium text-emerald-600">
                      +{confirmingSlot.isLastMinute ? "200" : "50"}
                    </span>
                  </div>
                </div>
              </div>

              {confirmingSlot.isLastMinute && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 mb-1">
                        Emergency Coverage
                      </p>
                      <p className="text-sm text-orange-700">
                        This shift needs immediate coverage due to a no-show.
                        You'll earn bonus points for helping out!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      Commitment Required
                    </p>
                    <p className="text-sm text-amber-700">
                      No-shows result in -200 points and may affect your
                      reputation. Only claim shifts you can definitely attend.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={confirmClaim}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:from-teal-700 hover:to-blue-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Claiming...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Confirm (+{confirmingSlot.isLastMinute ? "200" : "50"}{" "}
                        pts)
                      </span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setConfirmingSlot(null)}
                  disabled={loading}
                  className="flex-1 bg-slate-200 text-slate-700 px-4 py-3 rounded-lg font-medium hover:bg-slate-300 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
