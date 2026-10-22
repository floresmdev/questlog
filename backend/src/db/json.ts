// SQL fragments that build the API's JSON shapes (camelCase, as in
// frontend/src/api/types.ts) inside Postgres. Each takes the table alias.
// Timestamps come out as ISO 8601 strings in the session timezone.

export const areaJson = (a: string) =>
  `json_build_object('id', ${a}.id, 'name', ${a}.name, 'colorKey', ${a}.color_key)`;

export const userJson = (u: string) =>
  `json_build_object(
    'id', ${u}.id, 'email', ${u}.email, 'fullName', ${u}.full_name, 'role', ${u}.role,
    'initials', ${u}.initials, 'avatarColor', ${u}.avatar_color, 'jobTitle', ${u}.job_title,
    'isActive', ${u}.is_active, 'createdAt', ${u}.created_at)`;

export const buildJson = (b: string) =>
  `json_build_object(
    'id', ${b}.id, 'version', ${b}.version, 'buildNumber', ${b}.build_number,
    'plannedFor', ${b}.planned_for, 'releasedAt', ${b}.released_at, 'notes', ${b}.notes)`;

/** NULL instead of an object full of nulls when a LEFT JOIN found nothing. */
export const orNull = (alias: string, json: string) =>
  `CASE WHEN ${alias}.id IS NULL THEN NULL ELSE ${json} END`;

/** Joins needed by `taskListJson` (task alias `t`). */
export const TASK_LIST_JOINS = `
  JOIN areas a ON a.id = t.area_id
  LEFT JOIN users u ON u.id = t.assignee_id
  LEFT JOIN builds tb ON tb.id = t.target_build_id
  LEFT JOIN builds ib ON ib.id = t.integrated_build_id`;

/** A task plus what its card needs (TaskListItem). */
export const taskListJson = `json_build_object(
  'id', t.id, 'code', t.code, 'title', t.title, 'description', t.description,
  'areaId', t.area_id, 'assigneeId', t.assignee_id, 'status', t.status,
  'doneState', t.done_state, 'changeNote', t.change_note, 'priority', t.priority,
  'startDate', t.start_date, 'dueAt', t.due_at, 'completedAt', t.completed_at,
  'targetBuildId', t.target_build_id, 'integratedBuildId', t.integrated_build_id,
  'position', t.position, 'createdBy', t.created_by,
  'createdAt', t.created_at, 'updatedAt', t.updated_at,
  'area', ${areaJson('a')},
  'assignee', ${orNull('u', userJson('u'))},
  'targetBuild', ${orNull('tb', buildJson('tb'))},
  'integratedBuild', ${orNull('ib', buildJson('ib'))},
  'commentCount', (SELECT count(*)::int FROM comments c WHERE c.task_id = t.id))`;

/** Lane of a task (alias `t`), derived from status + done_state. */
export const LANE_SQL = `CASE
  WHEN t.status = 'pending' THEN 'pending'
  WHEN t.status = 'in_progress' THEN 'in_progress'
  WHEN t.done_state = 'active' THEN 'done_active'
  ELSE 'done_changed' END`;

/** Build order everywhere: newest first, planned builds by their target date. */
export const BUILD_ORDER = `coalesce(b.released_at, b.planned_for::timestamptz) DESC`;
