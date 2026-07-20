Feature: Environment System
  The game provides dynamic time-of-day lighting, weather effects, HDR environment
  maps, PBR ground textures, and atmospheric fog.

  # ── Time of Day ──

  Scenario: 4 time-of-day presets exist
    Given the time-of-day presets are loaded
    Then dawn, day, dusk, and night presets exist

  Scenario: Presets have valid lighting values
    Given a time-of-day preset
    Then ambientIntensity is in [0, 2]
    And fogNear is greater than 0
    And fogFar is greater than fogNear
    And temperatureCelsius is a number

  Scenario: All presets have HDR environment map paths
    Given a time-of-day preset
    Then hdrPath is a non-empty string

  Scenario: HDR paths reference the assets/hdr/ directory
    Given a time-of-day preset
    Then hdrPath starts with "assets/hdr/" and ends with ".exr"

  Scenario: All HDR files use EXR format
    Given all time-of-day presets
    Then all hdrPath values end with ".exr"

  Scenario: All HDR paths specify 1k resolution
    Given all time-of-day presets
    Then all hdrPath values contain "1k"

  Scenario: skyColor fallback exists on all presets
    Given all time-of-day presets
    Then each preset has a skyColor that is a THREE.Color

  Scenario: Night preset has elevated lighting
    Given the night preset
    Then ambientIntensity is 0.6
    And directionalIntensity is 0.6

  Scenario: Night preset has HDR vertical offset
    Given the night preset
    Then hdrVerticalOffset is 0.15

  Scenario: Non-night presets have no HDR vertical offset
    Given dawn, day, and dusk presets
    Then hdrVerticalOffset is undefined or 0

  Scenario: All presets have ambient and directional light colors
    Given all time-of-day presets
    Then each has ambientColor and directionalColor as THREE.Color instances
    And each has ambientIntensity and directionalIntensity greater than 0

  # ── Weather ──

  Scenario: 4 weather presets exist
    Given the weather presets are loaded
    Then clear, rain, fog, and storm presets exist

  Scenario: Clear weather has neutral multipliers
    Given the clear weather preset
    Then grip, drag, braking, and steer multipliers are all 1.0
    And rainIntensity is 0
    And fogDensityAdd is 0
    And visibility is 1.0

  Scenario: Rain reduces grip and visibility
    Given the rain weather preset
    Then gripMultiplier is less than 1.0
    And visibility is less than 1.0
    And rainIntensity is greater than 0

  Scenario: Fog reduces visibility more than rain
    Given the fog and rain weather presets
    Then fog visibility is less than rain visibility
    And fog fogDensityAdd is greater than rain fogDensityAdd
    And fog rainIntensity is 0

  Scenario: Storm has worst grip
    Given the storm and rain weather presets
    Then storm gripMultiplier is less than rain gripMultiplier
    And storm rainIntensity is 1.0

  Scenario: All presets have valid multiplier ranges
    Given all weather presets
    Then gripMultiplier is in (0, 1]
    And dragMultiplier is at least 1.0
    And brakingMultiplier is in (0, 1]
    And steerMultiplier is in (0, 1]
    And rainIntensity is in [0, 1]
    And fogDensityAdd is at least 0
    And visibility is in (0, 1]

  Scenario: Preset IDs match their keys
    Given all weather presets
    Then each preset's id matches its key
    And each preset has a truthy name

  # ── Environment Manager ──

  Scenario: EnvironmentManager has initEnvironmentMaps method
    Given an EnvironmentManager
    Then initEnvironmentMaps is a callable function

  # ── Car Headlights ──

  Scenario: CarController has setHeadlights method
    Given a CarController
    Then setHeadlights is a callable function
