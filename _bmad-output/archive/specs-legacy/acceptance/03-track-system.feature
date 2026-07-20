Feature: Track System
  The game provides 6 tracks with distinct themes, procedural spline generation,
  checkpoint-based lap counting, and release channel gating.

  # ── Definitions ──

  Scenario: Exactly 6 tracks are defined
    Given the track definitions are loaded
    Then there are exactly 6 tracks

  Scenario: All tracks have required fields
    Given the track definitions are loaded
    Then every track has id, name, at least 10 control points, distanceKm > 0,
      and at least 6 checkpoints

  Scenario: All track IDs are unique
    Given the track definitions are loaded
    Then no two tracks share the same ID

  Scenario: Track difficulties span Easy to Expert
    Given the track definitions are loaded
    Then the difficulty set includes Easy, Medium, Hard, and Expert

  Scenario: Typhoon Pass has elevation in control points
    Given the track definitions are loaded
    Then at least one Typhoon Pass control point has y > 0.5

  # ── Spline ──

  Scenario: Track creates a valid spline
    Given a track definition
    When a Track object is created
    Then the spline exists and is not null

  Scenario: Track spline forms a closed loop
    Given a track with a spline
    When evaluating points at t=0 and t=0.5
    Then the distance between them is greater than 10

  Scenario: All tracks create valid splines
    Given all 6 track definitions
    When creating Track objects for each
    Then spline points at t=0 and t=0.5 are more than 5 apart

  # ── Checkpoints & Laps ──

  Scenario: Track has a start position
    Given a track with checkpoints
    When getStartPosition(0) is called
    Then a defined position is returned

  Scenario: Track defaults to 3 laps
    Given a track
    Then lapCount is 3 and currentLap is 0

  # ── Build ──

  Scenario: Track builds into scene
    Given a track and a Three.js scene
    When track.build() is called
    Then the scene's children count increases

  Scenario: All tracks build into scene
    Given all 6 tracks
    When each track is built into a scene
    Then each track adds meshes to the scene

  # ── Geometry ──

  Scenario: Track center is a valid vector
    Given a track
    When getCenter() is called
    Then center.x and center.z are numbers within [-1000, 1000]

  Scenario: Track radius is positive
    Given a track
    When getRadius() is called
    Then the radius is between 0 and 1000

  # ── Release Channels ──

  Scenario: All tracks have a release channel
    Given the track definitions are loaded
    Then every track has a releaseChannel of "green" or "blue"

  Scenario: Midnight Circuit is the green release track
    Given the track definitions are loaded
    Then Midnight Circuit has releaseChannel "green"

  Scenario: All other tracks are blue releases
    Given the track definitions are loaded
    Then all tracks except Midnight Circuit have releaseChannel "blue"

  Scenario: Green channel returns only Midnight Circuit
    Given the track definitions are loaded
    When filtering tracks by releaseChannel "green"
    Then only Midnight Circuit is returned

  Scenario: Blue channel returns all tracks
    Given the track definitions are loaded
    When filtering tracks by releaseChannel "blue"
    Then all 6 tracks are returned
