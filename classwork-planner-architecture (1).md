# Classwork Schedule Planner

## 1. Project Overview

Build a simple full-stack classwork schedule planner using the MERN stack:

- MongoDB
- Express.js
- React
- Node.js

The application is designed for a student who wants to:

1. Create a recurring weekly class timetable.
2. See today's and upcoming classes.
3. Add homework/tasks to individual classes.
4. Give tasks due dates.
5. Mark tasks as completed.
6. Keep incomplete tasks as pending instead of creating duplicate tasks every week.
7. Automatically identify overdue tasks.
8. See pending, overdue, and completed work from a dashboard.

The application should be beginner-friendly, maintainable, and intentionally simple.

---

# 2. Core Concept

There are two important concepts:

### Recurring Class

A `Class` represents a timetable entry that repeats every week.

Example:

```text
Programming
Monday
14:00 - 15:00
```

The database should NOT create a new class document every Monday.

### Task

A `Task` represents actual work assigned to a class.

Example:

```text
Complete arrays assignment
Due: 2026-10-02
Completed: false
```

If the student does not complete it, the same task remains pending next week.

Do NOT create duplicate tasks when a new week begins.

---

# 3. MVP Features

## 3.1 Timetable

Student can:

- Add a class
- Edit a class
- Delete a class
- View weekly timetable

Class fields:

- Subject name
- Day of week
- Start time
- End time
- Optional room
- Optional teacher

Example:

```text
Monday

09:00 - 10:00  Mathematics
10:00 - 12:00  Physics
14:00 - 15:00  Programming
```

---

## 3.2 Today's Classes

The application should determine the current day automatically.

Example:

```text
TODAY

09:00 - 10:00
Mathematics

14:00 - 15:00
Programming
```

Classes should be sorted chronologically.

---

## 3.3 Class Details

Clicking a class should open its class page.

Example:

```text
Programming
Monday | 14:00 - 15:00

Tasks

[ ] Complete arrays assignment
    Due: Oct 2

[ ] Read pointers chapter
    Due: Oct 5

[+] Add Task
```

---

## 3.4 Tasks

Student can:

- Add a task
- Edit a task
- Delete a task
- Mark a task completed
- Add an optional description
- Add a due date

Task fields:

- Title
- Description
- Due date
- Completed
- Created date
- Completed date
- Class ID
- User ID

---

# 4. Task Status Logic

Do not store separate `status` values such as:

```text
pending
overdue
completed
```

Instead store:

```js
completed: Boolean
dueDate: Date | null
```

Calculate the display status.

### Completed

```text
completed === true
```

### Pending

```text
completed === false
AND
dueDate is null OR dueDate >= today
```

### Overdue

```text
completed === false
AND
dueDate < today
```

This avoids redundant database state.

---

# 5. Weekly Rollover

There should be NO weekly reset process.

The recurring timetable automatically represents the next week's classes.

Tasks remain independent of the weekly timetable.

Example:

```text
Monday, Sept 28

Programming
[ ] Complete arrays assignment
Due: Sept 30
```

Student doesn't complete it.

Next Monday:

```text
Programming

Pending:
[ ] Complete arrays assignment
Due: Sept 30
```

Do NOT create:

```text
Complete arrays assignment #2
```

The original task remains incomplete.

When completed:

```text
completed = true
completedAt = <completion timestamp>
```

It disappears from active pending/overdue lists.

Do not physically delete completed tasks.

---

# 6. Data Model

Use MongoDB with Mongoose.

## User

For the MVP:

```js
{
  _id,
  name,
  email
}
```

Authentication can initially be omitted if it significantly complicates the MVP.

However, structure the data model so authentication can be added later.

---

## Class

```js
{
  _id,
  userId,
  subjectName,
  dayOfWeek,
  startTime,
  endTime,
  room,
  teacher,
  createdAt,
  updatedAt
}
```

Example:

```js
{
  subjectName: "Programming",
  dayOfWeek: "Monday",
  startTime: "14:00",
  endTime: "15:00",
  room: "Lab 3",
  teacher: "Dr. Kumar"
}
```

Use a controlled representation for `dayOfWeek`, such as:

```text
Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday
```

---

## Task

```js
{
  _id,
  userId,
  classId,
  title,
  description,
  dueDate,
  completed,
  createdAt,
  completedAt,
  updatedAt
}
```

Rules:

- `title` is required.
- `description` is optional.
- `dueDate` is optional.
- `completed` defaults to `false`.
- `completedAt` is `null` until completion.
- A task belongs to exactly one class.
- Deleting a class should also remove its associated tasks after confirmation.

---

# 7. Relationships

```text
User
 │
 ├───────────────┐
 ▼               ▼
Classes         Tasks
 │               │
 │               │
 └───────┐       │
         ▼       │
       Class ◄───┘
              classId
```

Conceptually:

```text
One User
   │
   ├── Many Classes
   │
   └── Many Tasks

One Class
   │
   └── Many Tasks
```

---

# 8. Recommended MERN Architecture

```text
classwork-planner/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ClassCard.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── ClassForm.jsx
│   │   │   └── TaskForm.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Timetable.jsx
│   │   │   ├── ClassDetails.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── hooks/
│   │   │
│   │   ├── utils/
│   │   │   ├── dateUtils.js
│   │   │   └── taskUtils.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   └── package.json
│
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Class.js
│   │   └── Task.js
│   │
│   ├── controllers/
│   │   ├── classController.js
│   │   └── taskController.js
│   │
│   ├── routes/
│   │   ├── classRoutes.js
│   │   └── taskRoutes.js
│   │
│   ├── middleware/
│   │   └── errorMiddleware.js
│   │
│   ├── utils/
│   │   └── dateUtils.js
│   │
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── README.md
└── .gitignore
```

Do not create unnecessary folders until they are needed.

---

# 9. Backend Architecture

Use:

```text
Route
  ↓
Controller
  ↓
Model
  ↓
MongoDB
```

Example:

```text
POST /api/classes
        ↓
classRoutes.js
        ↓
classController.js
        ↓
Class.js
        ↓
MongoDB
```

Controllers should contain application logic.

Routes should remain thin.

---

# 10. API Design

## Classes

### Get all classes

```http
GET /api/classes
```

### Get one class

```http
GET /api/classes/:id
```

### Create class

```http
POST /api/classes
```

### Update class

```http
PUT /api/classes/:id
```

### Delete class

```http
DELETE /api/classes/:id
```

---

## Tasks

### Get tasks for a class

```http
GET /api/classes/:classId/tasks
```

### Get all active tasks

```http
GET /api/tasks
```

Optional query parameters:

```text
?status=pending
?status=overdue
?status=completed
```

### Create task

```http
POST /api/classes/:classId/tasks
```

### Update task

```http
PUT /api/tasks/:id
```

### Complete/uncomplete task

```http
PATCH /api/tasks/:id/toggle
```

### Delete task

```http
DELETE /api/tasks/:id
```

---

# 11. Frontend Pages

## Dashboard

Display:

```text
Good morning!

Today's Classes
----------------
09:00 Mathematics
11:00 Physics
14:00 Programming

Tasks
----------------
Overdue: 2
Pending: 4
Completed today: 3

Upcoming
----------------
Next class: Programming at 2:00 PM
```

Keep this visually simple.

---

## Timetable Page

Display the seven days.

Example:

```text
Monday       Tuesday       Wednesday
------------------------------------------------
Math         Physics       Programming
Physics      Digital       Mathematics
Programming  Electronics
```

For mobile screens, allow horizontal scrolling or switch to a day-based view.

---

## Class Details Page

Display:

```text
Programming

Monday
14:00 - 15:00
Lab 3

Tasks
----------------

OVERDUE
[ ] Complete arrays assignment
    Due Sep 28

PENDING
[ ] Read pointers chapter
    Due Oct 5

COMPLETED
[✓] Finish loops exercise
```

Provide:

```text
+ Add Task
```

---

# 12. Important Date Logic

Centralize date-related logic.

Do not scatter date calculations throughout React components.

Create utility functions such as:

```js
getTodayClasses()
isOverdue()
isPending()
getCurrentDayOfWeek()
sortClassesByTime()
```

Be careful with:

- Local date vs UTC
- Date-only due dates
- Time comparisons
- Midnight boundaries

For the MVP, use the student's local timezone.

Avoid adding a timezone library unless there is an actual need.

---

# 13. Edge Cases

The application should handle:

### Duplicate/overlapping classes

Allow them initially, but optionally show a warning.

### Due date before creation date

Reject it.

### No due date

Allow:

```text
dueDate: null
```

### Completed after due date

Still show it as completed.

Keep `completedAt` so late completion can be tracked.

### Deleting a class

Show a confirmation warning because associated tasks will also be deleted.

### Editing a class

Existing tasks remain attached to the same class.

Changing:

```text
Physics
10:00 AM
```

to:

```text
Physics
11:00 AM
```

must not modify its tasks.

### Multiple tasks

A class can have unlimited tasks.

### Empty timetable

Show a helpful empty state instead of a blank screen.

### No tasks

Show:

```text
No tasks yet.
You're caught up. 🎉
```

### Invalid time

End time must be after start time.

---

# 14. Validation

Validate on both frontend and backend.

Class:

```text
subjectName: required
dayOfWeek: required
startTime: required
endTime: required
endTime > startTime
```

Task:

```text
title: required
dueDate: optional
dueDate >= created date
```

Never rely only on frontend validation.

---

# 15. Error Handling

Backend should return consistent responses.

Example:

```json
{
  "success": false,
  "message": "Class not found"
}
```

Success:

```json
{
  "success": true,
  "data": {}
}
```

Frontend should show useful error messages instead of silently failing.

---

# 16. UI Principles

Keep the first version clean and simple.

Prioritize:

1. Readability
2. Fast task entry
3. Clear task status
4. Clear timetable
5. Mobile responsiveness

Use visual distinction for:

```text
Completed
Pending
Overdue
```

Do not make the UI unnecessarily complicated.

Avoid adding animations everywhere.

---

# 17. Development Strategy

Build incrementally.

### Phase 1

Set up:

```text
React
Node
Express
MongoDB
```

Verify that frontend and backend communicate.

### Phase 2

Implement Classes CRUD.

### Phase 3

Build timetable UI.

### Phase 4

Implement Tasks CRUD.

### Phase 5

Implement task completion.

### Phase 6

Implement pending/overdue calculations.

### Phase 7

Build Dashboard.

### Phase 8

Polish responsive UI and error handling.

### Phase 9

Only after the MVP works, consider:

- Authentication
- Notifications
- Calendar integration
- Statistics
- Search
- Recurring task templates
- PWA/mobile app

---

# 18. Things NOT to Build Initially

Do not add these to the MVP:

- AI assistant
- Authentication
- Push notifications
- Email notifications
- Google Calendar integration
- Social features
- Gamification
- Complex analytics
- Multiple semesters
- Multiple users with roles
- Offline synchronization
- Native mobile application

The goal is to get the core loop working:

```text
Create class
     ↓
Class occurs every week
     ↓
Add task
     ↓
Complete task
     ↓
If incomplete → remains pending
     ↓
If due date passes → overdue
```

---

# 19. Definition of Done

The MVP is complete when a student can:

1. Create a weekly timetable.
2. See today's classes automatically.
3. Open a class.
4. Add homework.
5. Give homework a due date.
6. Mark homework complete.
7. See incomplete homework as pending.
8. See overdue homework automatically.
9. Return the following week and still see incomplete work.
10. Avoid duplicate tasks.
11. Edit/delete classes and tasks.
12. Use the application comfortably on desktop and mobile.

