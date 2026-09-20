# Dissonant — Project Specification

## 1. Product Overview

**Dissonant** is a personal music organization and playback application centered around user-uploaded audio.

It is designed for musicians, producers, students, and anyone who wants a more flexible way to organize and listen to their own music.

The core experience is:

**Upload → Organize → Play → Manipulate**

Dissonant is **not** intended to be a streaming service, social network, or full digital audio workstation.

Its main purpose is to give users a clean personal music library with stronger playback controls than traditional music apps.

---

# 2. Core Organizational Model

The application uses a simple three-level hierarchy:

```text
Folder
  └── Project
        └── Track
```

## Folder

A folder groups related projects.

Example:

```text
2026 Music
├── Album
├── Beats
└── Unfinished Songs
```

A folder may contain multiple projects.

Folders do **not** contain tracks directly.

For the initial version, folders cannot contain other folders.

### Folder actions

Users can:

* create a folder
* rename a folder
* delete a folder
* open a folder
* move projects into or out of a folder

---

## Project

A project behaves like a playlist for the user's uploaded music.

Examples:

* Album
* Beats
* Piano Practice
* Unfinished Songs
* Demo Ideas

A project contains an ordered list of tracks.

### Project actions

Users can:

* create a project
* rename a project
* delete a project
* optionally add project artwork
* move a project between folders
* upload tracks into a project
* reorder tracks
* play tracks in project order

---

## Track

A track represents one user-uploaded audio file.

Supported formats should initially include common browser-supported formats such as:

* MP3
* WAV
* M4A/AAC where browser support allows

Each track should store:

* title
* file reference
* duration
* track order
* date uploaded
* project ID
* optional artwork
* optional metadata added later

Users can:

* upload tracks
* play tracks
* rename tracks
* delete tracks
* reorder tracks
* seek within a track
* use advanced playback controls

---

# 3. Product Philosophy

Dissonant should feel like a **personal music workspace**, not a Spotify clone.

Traditional streaming workflow:

```text
Discover → Stream → Playlist
```

Dissonant workflow:

```text
Upload → Organize → Work With → Listen
```

The application should prioritize:

1. the user's own audio
2. fast organization
3. excellent playback
4. clear hierarchy
5. useful musician-oriented controls
6. simple interactions

Avoid unnecessary social or discovery features.

---

# 4. Main Application Areas

The MVP should contain these primary areas:

1. Library
2. Folder View
3. Project View
4. Audio Player

Search may be added after the core experience works correctly.

---

# 5. Library

The Library is the user's main home screen.

It should display their folders and projects in a visually clean grid.

Example:

```text
YOUR LIBRARY

2026 Music
3 Projects

Piano
2 Projects

Ideas
4 Projects

+ New Folder
+ New Project
```

Users should be able to quickly distinguish folders from individual projects.

## Library behavior

Users can:

* open folders
* open projects
* create folders
* create projects
* rename items
* delete items
* move projects into folders

The interface should remain uncluttered even with many projects.

---

# 6. Folder View

Opening a folder shows all projects contained inside it.

Example:

```text
← Library

2026 MUSIC

Album
12 Tracks

Beats
18 Tracks

Unfinished Songs
7 Tracks

+ New Project
```

Users should be able to:

* open projects
* create projects inside the folder
* rename the folder
* move projects
* delete projects
* remove a project from the folder without deleting the project where appropriate

---

# 7. Project View

The Project View is one of the most important screens in Dissonant.

It represents a playlist-like collection of tracks.

The page should include:

* project artwork
* project title
* folder name
* track count
* upload button
* ordered track list
* playback controls

Example:

```text
2026 Music / Album

ALBUM

12 TRACKS                         + UPLOAD

01   Intro.wav               2:14
02   Daylight.mp3            3:41
03   Demo 4.wav              2:56
04   Outro.wav               1:48
```

## Track list behavior

Users can:

* click a track to play it
* drag tracks to reorder them
* rename a track
* delete a track
* access additional track actions

The displayed order must also determine playback order.

---

# 8. Track Reordering

Tracks inside a project should support drag-and-drop ordering.

A visible drag handle may be used:

```text
≡   01   Intro.wav
≡   02   Daylight.mp3
≡   03   Demo.wav
```

Changing the order should immediately update the project.

Eventually the order should persist between devices when Firestore is added.

---

# 9. Audio Player

The player is a major differentiator for Dissonant.

A compact global player should remain available while navigating through the app.

It should contain:

* artwork
* track title
* project name
* play/pause
* previous
* next
* progress timeline
* elapsed time
* total duration
* volume
* expanded-player control

Example:

```text
Daylight
Album

0:48 ─────────────●────────────── 3:41

        ◀       ▶/❚❚       ▶
```

The global player should continue playing when the user navigates between pages.

---

# 10. Expanded Player

Selecting the player should open a larger playback interface.

The expanded player should provide access to:

* timeline
* A-B looping
* playback speed
* pitch
* volume
* track information
* artwork
* previous/next controls

Advanced controls should not overcrowd the normal compact player.

---

# 11. A-B Section Looping

A-B looping is a core Dissonant feature.

It lets a user repeatedly listen to a specific portion of a song.

The user defines:

* **A** = loop start
* **B** = loop end

Example:

```text
             A                    B
             ▼                    ▼
────────────[=====================]────────
```

When looping is enabled, only the selected region should repeat.

## Required controls

Users must be able to:

* set point A
* set point B
* visually see the loop region
* enable/disable the loop
* change A
* change B
* clear the loop

Invalid loop ranges should be prevented.

For example:

```text
A = 1:45
B = 1:20
```

should not be accepted without correction.

---

# 12. Playback Speed

Users should be able to change playback speed independently of musical pitch.

Initial range:

```text
0.5× — 2.0×
```

Useful presets may include:

```text
0.5×
0.75×
1.0×
1.25×
1.5×
2.0×
```

Changing speed should not intentionally transpose the song.

The user's current playback position and A-B loop should continue functioning while speed changes.

---

# 13. Pitch Control

Users should be able to transpose audio without changing playback speed.

Initial range:

```text
-12 semitones → +12 semitones
```

Default:

```text
0 semitones
```

Examples:

```text
Speed: 0.75×
Pitch: 0
```

and:

```text
Speed: 1.0×
Pitch: -3
```

Pitch and speed must be treated as separate controls.

This functionality should be implemented only after normal audio playback, looping, and speed controls are stable.

---

# 14. Upload Experience

Users should be able to upload audio directly into a project.

The upload workflow should be simple:

```text
Open Project
    ↓
Upload
    ↓
Choose Audio Files
    ↓
Files Process
    ↓
Tracks Appear
```

Multiple-file upload should eventually be supported.

During upload, the UI should show:

* filename
* upload progress where applicable
* processing state
* error state

Unsupported files should produce a clear error rather than silently failing.

---

# 15. Local-First Development Strategy

The initial version should work locally before introducing Firebase.

Use browser storage such as **IndexedDB** during the prototype stage.

Initially store:

* folders
* projects
* track metadata
* uploaded audio files
* track order

This allows the complete product experience to be tested before backend complexity is introduced.

Firebase should be added only after the local application is reliable.

---

# 16. Final Backend Architecture

Once the local MVP works, migrate to Firebase.

Use:

## Firebase Authentication

Responsible for:

* account creation
* login
* logout
* persistent sessions
* user identity

---

## Cloud Firestore

Store structured application data.

Suggested conceptual structure:

```text
users
folders
projects
tracks
```

Every folder, project, and track must belong to a user.

Users must never be able to read or modify another user's private library.

---

## Firebase Cloud Storage

Used for the actual uploaded audio files.

Do **not** place binary MP3/WAV files inside Firestore.

Conceptually:

```text
users/
  USER_ID/
    tracks/
      TRACK_ID/
        audio.mp3
```

Firestore should store the metadata and Storage reference.

---

# 17. Conceptual Data Model

## User

```text
id
email
displayName
createdAt
```

## Folder

```text
id
userId
name
createdAt
updatedAt
```

## Project

```text
id
userId
folderId
name
artwork
createdAt
updatedAt
```

`folderId` may be empty if a project is not currently inside a folder.

## Track

```text
id
userId
projectId
title
audioReference
duration
order
artwork
createdAt
```

Do not add unnecessary database fields until a feature requires them.

---

# 18. Frontend Technology

Use:

* React
* TypeScript
* Vite
* Tailwind CSS

The application should be component-based.

Avoid unnecessary architectural complexity.

---

# 19. Suggested Component Architecture

Conceptually:

```text
App

├── Navigation
│
├── Library
│   ├── FolderCard
│   └── ProjectCard
│
├── FolderView
│   └── ProjectCard
│
├── ProjectView
│   ├── ProjectHeader
│   ├── UploadButton
│   └── TrackList
│       └── TrackRow
│
└── Player
    ├── CompactPlayer
    └── ExpandedPlayer
        ├── Timeline
        ├── LoopControls
        ├── SpeedControl
        └── PitchControl
```

Do not treat this as a mandatory exact folder structure.

The implementation agent may make reasonable technical adjustments as long as the product architecture remains clean.

---

# 20. Audio Architecture

Audio functionality should be isolated from visual components.

Do not place all audio logic directly inside the Player UI component.

Create a reusable audio/player system responsible for:

* current track
* playback state
* playback position
* duration
* queue
* previous/next
* speed
* A-B loop
* pitch processing

The UI should consume this state rather than implementing the audio engine itself.

This will make advanced playback substantially easier to maintain.

---

# 21. Playback Queue

For the MVP, playback order follows the current project's track order.

Example:

```text
Project

01 Intro
02 Daylight
03 Demo
04 Outro
```

If `Daylight` is playing:

**Next** → Demo
**Previous** → Intro

Do not implement a complicated queue-management system in the first version.

---

# 22. Visual Source of Truth

`DESIGN.md` is the authoritative visual reference.

The implementation must preserve its design system.

Important characteristics include:

* dark monochrome interface
* high contrast
* vibrant orange "Heat" accent
* Inter typography
* strict spacing system
* flat tonal layering
* minimal shadows
* geometric controls
* restrained rounded corners
* high-density music interfaces

Do not redesign the application into a generic SaaS dashboard or Spotify clone.

---

# 23. Color Philosophy

Primary surfaces should remain black/dark gray.

The orange accent should be used intentionally for important states such as:

* playback progress
* active playback
* selected controls
* important primary actions

Do not cover the interface in orange.

White should remain the dominant high-contrast content color.

---

# 24. Typography

Use **Inter** throughout the application.

Typography should establish clear hierarchy between:

* page titles
* project names
* track titles
* metadata
* labels
* timestamps

Large typography should be used selectively.

Track tables and metadata should remain compact and information-dense.

---

# 25. Layout Behavior

## Desktop

Use:

* persistent left navigation
* generous safe margins
* multi-column layouts
* dense project/track layouts

## Mobile

Use:

* bottom navigation
* reduced margins
* full-width track rows
* responsive project cards
* touch-friendly playback controls

The mobile version should be intentionally designed rather than simply shrinking the desktop interface.

---

# 26. Interaction Design

Interactions should feel immediate and restrained.

Use:

* subtle opacity changes
* subtle background changes
* clear active states
* concise transitions

Avoid:

* large bouncing animations
* excessive gradients
* glowing effects
* heavy shadows
* glassmorphism
* decorative animations that distract from music

---

# 27. Empty States

Important empty states must be intentionally designed.

## Empty Library

Example:

```text
Your library is empty.

Create your first project or folder to get started.

[ New Project ]
[ New Folder ]
```

## Empty Project

Example:

```text
No tracks yet.

Upload audio to start building this project.

[ Upload Tracks ]
```

Do not display broken or meaningless empty tables.

---

# 28. Loading States

Loading states should preserve the dark visual system.

Use simple:

* skeleton rows
* subtle indicators
* progress values for uploads

Avoid visually distracting loading animations.

---

# 29. Error States

Errors should clearly explain:

1. what happened
2. what the user can do next

Examples:

```text
This audio format isn't supported.
Try uploading an MP3 or WAV file.
```

or:

```text
Upload failed.
Try again.
```

Do not expose raw technical error messages to normal users.

---

# 30. Accessibility

The application should include:

* keyboard-accessible controls
* clear focus states
* accessible button labels
* sufficient contrast
* reasonable touch targets
* semantic HTML where possible

Custom playback controls must remain keyboard accessible.

---

# 31. MVP Features

The first complete version should contain:

### Organization

* create folder
* rename folder
* delete folder
* create project
* rename project
* delete project
* move project between folders

### Tracks

* upload audio
* rename track
* delete track
* reorder tracks
* display duration

### Playback

* play
* pause
* seek
* previous
* next
* volume

### Advanced Playback

* A-B looping
* speed adjustment
* independent pitch adjustment

### Persistence

Initially:

* IndexedDB

Later:

* Firebase Authentication
* Firestore
* Firebase Storage

---

# 32. Explicit Non-Goals for MVP

Do NOT add these features unless specifically requested later:

* social feeds
* comments
* followers
* public profiles
* algorithmic recommendations
* music discovery
* streaming catalogs
* AI-generated music
* AI chat
* collaboration
* real-time collaborative editing
* stems
* waveform editing
* multitrack DAW functionality
* EQ
* effects chains
* mastering tools
* marketplace
* subscriptions
* complicated queue systems
* nested folders
* sharing links

These features may be considered later.

They must not complicate the MVP.

---

# 33. Development Phases

## Phase 1 — Design Extraction

Completed separately in `DESIGN.md`.

---

## Phase 2 — Product Specification

This document.

---

## Phase 3 — Frontend Shell

Build using mock data only.

Implement:

* layout
* navigation
* Library
* Folder View
* Project View
* track list
* player UI

Do not add Firebase.

---

## Phase 4 — Visual QA

Compare the implementation directly against the Stitch source.

Correct:

* spacing
* colors
* typography
* sizing
* alignment
* responsive behavior

---

## Phase 5 — Local Organization

Implement:

* folders
* projects
* CRUD actions
* local persistence using IndexedDB

---

## Phase 6 — Track Management

Implement:

* audio upload
* metadata
* rename
* delete
* drag-and-drop ordering

---

## Phase 7 — Basic Audio Engine

Implement:

* play
* pause
* seek
* previous
* next
* volume
* project playback order

---

## Phase 8 — A-B Looping

Add section-loop functionality.

---

## Phase 9 — Playback Speed

Implement speed adjustment while preserving pitch.

---

## Phase 10 — Pitch

Implement independent pitch shifting.

This should be treated as a technically advanced feature and implemented only after the basic player is stable.

---

## Phase 11 — Firebase Setup

Connect:

* Firebase Authentication
* Cloud Firestore

Do not migrate audio until the data model and security rules are verified.

---

## Phase 12 — Account + Cloud Metadata

Move:

* folders
* projects
* track metadata
* ordering

to Firestore.

---

## Phase 13 — Cloud Audio

When appropriate, enable Firebase Cloud Storage and migrate uploaded audio to cloud-backed storage.

---

## Phase 14 — Final QA and Polish

Perform:

* visual audit
* mobile testing
* accessibility testing
* playback testing
* error-state testing
* performance review
* architecture cleanup

---

# 34. Rules for AI Coding Agents

Before modifying the codebase, agents should read:

1. `DESIGN.md`
2. `PROJECT_SPEC.md`

The following rules apply:

* Do not redesign the product without explicit instruction.
* Do not add features outside the current development phase.
* Do not introduce unnecessary libraries.
* Do not over-engineer simple features.
* Preserve working functionality.
* Keep components reusable.
* Keep audio logic separate from presentation.
* Test changes before declaring them complete.
* Fix runtime and compilation errors before stopping.
* Do not automatically begin the next development phase.
* Ask or report when an important product decision is genuinely ambiguous.

---

# 35. Definition of Success

Dissonant succeeds when a user can:

1. open the app
2. organize projects into folders
3. upload their own music
4. arrange tracks in an intentional order
5. immediately play those tracks
6. isolate and repeat a specific section
7. slow down or speed up playback
8. transpose pitch independently
9. return later and find their library preserved

The experience should feel focused, fast, deliberate, and built around the user's own music.
