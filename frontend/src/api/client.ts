import type {
  ActivityItem,
  AgendaItem,
  Area,
  AreaCount,
  AreaProgressItem,
  BoardFilters,
  BoardLane,
  Build,
  BuildHistoryItem,
  CalendarEvent,
  CurrentBuild,
  Deadline,
  DoneBreakdown,
  Id,
  ISODate,
  OverviewStats,
  PriorityStats,
  TaskDetail,
  TaskStats,
  User,
  WeeklyCompletedPoint,
} from './types';

/**
 * Everything the UI can ask the backend for. Components never import mocks or
 * call fetch directly; they go through an implementation of this interface.
 * Each method maps 1:1 to a future REST endpoint under /api.
 */
export interface QuestlogApi {
  // Session & reference data
  getCurrentUser(): Promise<User>; //                         GET /api/me
  getUsers(): Promise<User[]>; //                              GET /api/users
  getAreas(): Promise<Area[]>; //                              GET /api/areas
  getBuilds(): Promise<Build[]>; //                            GET /api/builds
  getCurrentBuild(): Promise<CurrentBuild>; //                 GET /api/builds/current

  // Tasks screen
  getBoard(filters?: BoardFilters): Promise<BoardLane[]>; //   GET /api/board?areaId=&assigneeId=&buildId=
  getTask(id: Id): Promise<TaskDetail>; //                     GET /api/tasks/:id
  getTaskStats(): Promise<TaskStats>; //                       GET /api/stats/tasks
  getPriorityStats(): Promise<PriorityStats>; //               GET /api/stats/priorities
  getAreaWorkload(): Promise<AreaCount[]>; //                  GET /api/stats/area-workload
  getActivity(feed: 'tasks' | 'overview'): Promise<ActivityItem[]>; // GET /api/activity?feed=

  // Overview screen
  getOverviewStats(): Promise<OverviewStats>; //               GET /api/stats/overview
  getAreaProgress(): Promise<AreaProgressItem[]>; //           GET /api/stats/area-progress
  getWeeklyCompleted(weeks: number): Promise<WeeklyCompletedPoint[]>; // GET /api/stats/weekly-completed?weeks=
  getAgenda(date: ISODate): Promise<AgendaItem[]>; //          GET /api/agenda?date=
  getCalendarEvents(from: ISODate, to: ISODate): Promise<CalendarEvent[]>; // GET /api/calendar?from=&to=
  getUpcomingDeadlines(limit: number): Promise<Deadline[]>; // GET /api/deadlines?limit=
  getBuildHistory(limit: number): Promise<BuildHistoryItem[]>; // GET /api/builds/history?limit=
  getDoneBreakdown(): Promise<DoneBreakdown>; //               GET /api/stats/done-breakdown
}
