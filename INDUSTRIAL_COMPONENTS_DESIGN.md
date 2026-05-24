# 🏭 Industrial Components System Design

## Executive Summary

Velxio-ni **real-world IoT & industrial platform** qilish uchun 10 ta advanced component qo'shadi. Hozirda Wokwi/Tinkercad'da yo'q komponentlarni integrate qilamiz.

---

## 📋 10 Key Industrial Components (MVP)

### 🔌 Tier 1: Industrial Sensors (5 ta)

| Komponent | Model | Qo'llanish | Pins | Simulation |
|-----------|-------|-----------|------|-----------|
| **1. PT1000 Temperature** | Resistance 0Ω-4000Ω | Manufacturing, HVAC | ADC, Power | RTD resistance → temperature formula |
| **2. 4–20mA Pressure** | I2C/ADC output | Factory automation | I2C or ADC | Pressure value injection |
| **3. Ultrasonic Sensor** | JSN-SR04T waterproof | Water level, robotics | TRIG, ECHO | Echo time ↔ distance |
| **4. Industrial Gas Detector** | MQ-x sensors (real) | Safety systems | ADC | PPM concentration formula |
| **5. Optical Encoder** | Rotary position | Motor control | Digital interrupt | Pulse generation |

### ⚙️ Tier 2: Motor & Power Electronics (3 ta)

| Komponent | Model | Qo'llanish | Pins | Simulation |
|-----------|-------|-----------|------|-----------|
| **6. BLDC Motor Controller** | ESC 30-50A | Drone, robotics | PWM, direction | Speed/current feedback |
| **7. Industrial H-Bridge** | BTS7960/VNH2SP30 | 30A+ motor control | PWM, dir, enable | Power dissipation |
| **8. DC-DC Converter** | 12V→5V, 20A | Power distribution | Input, output | Efficiency model |

### 📡 Tier 3: Communication (2 ta)

| Komponent | Model | Qo'llanish | Pins | Simulation |
|-----------|-------|-----------|------|-----------|
| **9. LoRa Module** | SX1276 (868MHz) | Long-range IoT | SPI | Simulated packet send/recv |
| **10. Industrial Modbus Gateway** | RS485 node | Legacy system | UART, Modbus | Protocol translator |

---

## 🏗️ System Architecture

### Frontend - Component Hierarchy

```
src/components/
├── components-industrial/          [NEW]
│   ├── PT1000TemperatureSensor.tsx
│   ├── PressureSensor4to20ma.tsx
│   ├── UltrasonicSensorWaterproof.tsx
│   ├── IndustrialGasDetector.tsx
│   ├── OpticalEncoder.tsx
│   ├── BLDCController.tsx
│   ├── IndustrialHBridge.tsx
│   ├── DCDC_Converter.tsx
│   ├── LoRaModule.tsx
│   └── ModbusGateway.tsx
├── components-wokwi/               [EXISTING]
│   └── ...
└── DynamicComponent.tsx            [MODIFIED] → Industrial support
```

### Backend - Component Model

```
backend/app/models/
├── component.py                    [NEW]
│   ├── ComponentType enum
│   │   ├── SENSOR_INDUSTRIAL
│   │   ├── MOTOR_DRIVER
│   │   ├── POWER_ELECTRONICS
│   │   └── COMMUNICATION
│   ├── ComponentMetadata
│   │   ├── id, name, category
│   │   ├── simulationParams
│   │   ├── supportedBoards
│   │   └── pinMappings
│   └── ComponentInstance
│       ├── projectId, metadataId
│       ├── position, rotation
│       ├── properties (dynamic)
│       └── simulationState
└── project.py                      [MODIFIED]
    └── components: List[ComponentInstance]
```

### Simulation - Parts Registry

```
frontend/src/simulation/parts/
├── SensorParts.ts                  [MODIFIED]
│   ├── PT1000Part
│   ├── PressureSensorPart
│   ├── UltrasonicWaterproofPart
│   ├── GasDetectorPart
│   └── EncoderPart
├── MotorParts.ts                   [NEW]
│   ├── BLDCControllerPart
│   ├── HBridgePart
│   └── DCDC_ConverterPart
├── CommParts.ts                    [NEW]
│   ├── LoRaPart
│   └── ModbusPart
└── PartSimulationRegistry.ts       [MODIFIED]
    └── register industrial parts
```

---

## 📐 Data Schema (Backend)

### Component Metadata Table

```python
# backend/app/models/component.py
class ComponentMetadataDB(Base):
    __tablename__ = "component_metadata"
    
    id: str                              # unique ID (e.g. "pt1000-temperature")
    name: str                            # display name
    category: str                        # "industrial-sensor", "motor-driver", etc
    description: str                     # long description
    tags: List[str]                      # search tags (JSON)
    
    # Simulation parameters
    simulation_type: str                 # "analog-sensor", "pwm-controller", "protocol"
    default_properties: Dict[str, Any]   # default parameter values
    property_schema: Dict[str, Any]      # JSON Schema for validation
    
    # Hardware mapping
    pin_count: int
    pin_descriptions: Dict[str, str]     # pin name → description
    default_pin_connections: Dict[str, str]  # "power" → "5V", "gnd" → "GND"
    
    # Compatibility
    supported_boards: List[str]          # ["arduino-uno", "esp32", ...]
    min_firmware_version: str | None     # for boards requiring updates
    
    # UI metadata
    thumbnail_svg: str                   # SVG component icon
    component_type: str                  # "component-industrial"
    examples: List[Dict[str, str]]       # use case examples
    
    created_at: DateTime
    updated_at: DateTime
```

### Component Instance (in Project)

```python
class ComponentInstance(Base):
    __tablename__ = "component_instances"
    
    id: str                              # UUID
    project_id: str (FK)                 # links to project
    metadata_id: str (FK)                # links to metadata
    
    # Canvas state
    position_x: float
    position_y: float
    rotation: int                        # 0, 90, 180, 270
    
    # Dynamic properties
    properties: Dict[str, Any]           # JSON: user-set values
    initial_state: Dict[str, Any]        # JSON: simulation startup state
    
    # Wiring
    pin_assignments: Dict[str, int]      # pin_name → arduino_pin
    
    # Runtime state (transient)
    runtime_data: Dict[str, Any]         # JSON: current simulation values
    
    created_at: DateTime
    updated_at: DateTime
```

---

## 🔌 Component Pin & Simulation Specs

### 1️⃣ PT1000 Temperature Sensor

```typescript
interface PT1000Component {
  id: "pt1000-temperature"
  pins: { 
    "Positive": number,      // Vcc
    "Negative": number,      // GND
    "Signal": number         // ADC pin
  }
  properties: {
    minTemp: number          // -50°C default
    maxTemp: number          // 100°C default
    accuracy: "±0.5" | "±1.0" | "±2.0"
  }
  simulation: {
    // Callendar-Van Dusen equation: R(T) = R0 * (1 + A*T + B*T² + ...)
    // Simplified: R = 1000 * (1 + 0.00385 * T)
    updateRate: 100          // ms
    outputFormula: "rtdResistance(tempC) → ADC 0-1023"
  }
}
```

**Simulation Logic:**
```javascript
// Temperature → Resistance formula
function rtdToResistance(tempC: number): number {
  const R0 = 1000;  // Base resistance at 0°C
  const A = 0.00385;
  return R0 * (1 + A * tempC);
}

// Resistance → ADC value (0-1023 for Uno)
function resistanceToADC(resistance: number): number {
  const referenceVoltage = 5.0;
  const seriesResistance = 4700; // 4.7k pullup
  const voltage = referenceVoltage * (seriesResistance / (seriesResistance + resistance));
  return Math.round((voltage / referenceVoltage) * 1023);
}
```

---

### 2️⃣ 4–20mA Industrial Pressure Sensor

```typescript
interface PressureSensor4to20ma {
  id: "pressure-4-20ma"
  pins: {
    "Positive (12V)": number,
    "Negative (GND)": number,
    "Signal (ADC)": number
  }
  properties: {
    pressureMin: number      // 0 bar (default)
    pressureMax: number      // 10 bar (default)
    unit: "bar" | "psi" | "pascal"
  }
  simulation: {
    // 4mA = min pressure, 20mA = max pressure
    // V = I × R_sense (e.g., R_sense = 250Ω → 1-5V)
    outputFormula: "pressure → 4-20mA → 1-5V → ADC"
  }
}
```

---

### 3️⃣ Ultrasonic Sensor (JSN-SR04T Waterproof)

```typescript
interface UltrasonicWaterproof {
  id: "ultrasonic-waterproof-sr04t"
  pins: {
    "VCC": number,           // 5V
    "GND": number,
    "TRIG": number,          // PWM trigger (10µs pulse)
    "ECHO": number           // Pulse-width echo
  }
  properties: {
    minDistance: number      // 30cm
    maxDistance: number      // 450cm (waterproof variant)
    measurmentRate: number   // 50ms between measurements
  }
  simulation: {
    // Arduino sends 10µs pulse → waits for echo pulse
    // distance_cm = (pulse_duration_microseconds × 0.034) / 2
  }
}
```

---

### 6️⃣ BLDC Motor ESC Controller

```typescript
interface BLDCController {
  id: "bldc-controller-esc"
  pins: {
    "Signal": number,        // PWM input (1000-2000µs)
    "Power+": number,        // Battery (+)
    "Power-": number,        // Battery (-)
    "GND": number,           // Common ground
    "Feedback": number       // Optional RPM feedback
  }
  properties: {
    minThrottle: number      // 1000µs (0%)
    maxThrottle: number      // 2000µs (100%)
    polarity: "normal" | "reversed"
    maxRPM: number           // 10000 default
  }
  simulation: {
    // PWM duty → RPM (linear interpolation)
    // RPM → current draw (efficiency model)
    // Current → voltage drop simulation
  }
}
```

---

### 9️⃣ LoRa Module (SX1276)

```typescript
interface LoRaModule {
  id: "lora-sx1276"
  pins: {
    "VCC": number,           // 3.3V
    "GND": number,
    "MISO": number,          // SPI
    "MOSI": number,
    "SCK": number,
    "CS": number,            // Chip select
    "RST": number,           // Reset
    "DIO0": number           // Interrupt
  }
  properties: {
    frequency: "433" | "868" | "915"  // MHz
    bandwidth: "125" | "250" | "500"  // kHz
    spreadingFactor: 7..12            // SF7-SF12
    codingRate: "4/5" | "4/6" | "4/7" | "4/8"
    txPower: -17..20                  // dBm
  }
  simulation: {
    // Simulated packet transmission (no real RF)
    // - API: send packet → virtual receive buffer
    // - GPIO interrupt on packet arrival
    // - SNR/RSSI simulation
  }
}
```

---

## 🎯 Implementation Plan

### Phase 1: Backend Infrastructure (Week 1)

- [ ] ComponentMetadata model + migrations
- [ ] ComponentInstance model + FK to projects
- [ ] API endpoints:
  - `GET /api/components/` → List all metadata
  - `POST /api/components/register` → Add custom component
  - `GET /api/components/{id}` → Get metadata
  - `GET /api/projects/{id}/components` → Get project components
  - `POST /api/projects/{id}/components` → Add to project
  - `DELETE /api/projects/{id}/components/{cid}` → Remove

### Phase 2: Frontend Component System (Week 2)

- [ ] Create `components-industrial/` folder
- [ ] Implement 10 component React wrappers
- [ ] Register in DynamicComponent system
- [ ] Update ComponentRegistry to load industrial metadata
- [ ] Add industrial category to picker UI

### Phase 3: Simulation Integration (Week 3)

- [ ] Create `SensorParts.ts` + `MotorParts.ts` + `CommParts.ts`
- [ ] Implement simulation logic for each part
- [ ] Register in PartSimulationRegistry
- [ ] PinManager listeners for each component
- [ ] Test with example circuits

### Phase 4: UI & UX Polish (Week 4)

- [ ] Component property dialogs for industrial params
- [ ] Sensor control panel for real-time injection
- [ ] Error checking (missing pins, invalid connections)
- [ ] Example projects using industrial components

---

## 💻 Database Migration Example

```sql
-- Create component_metadata table
CREATE TABLE component_metadata (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    tags JSON,
    simulation_type TEXT,
    default_properties JSON,
    property_schema JSON,
    pin_count INTEGER,
    pin_descriptions JSON,
    default_pin_connections JSON,
    supported_boards JSON,
    thumbnail_svg TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create component_instances table
CREATE TABLE component_instances (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    metadata_id TEXT NOT NULL REFERENCES component_metadata(id),
    position_x REAL,
    position_y REAL,
    rotation INTEGER DEFAULT 0,
    properties JSON,
    initial_state JSON,
    pin_assignments JSON,
    runtime_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert PT1000 metadata
INSERT INTO component_metadata VALUES (
    'pt1000-temperature',
    'PT1000 Temperature Sensor',
    'industrial-sensor',
    'Industrial RTD temperature sensor (Callendar-Van Dusen)',
    '["temperature", "sensor", "rtd", "industrial"]',
    'analog-sensor',
    '{"minTemp": -50, "maxTemp": 100, "accuracy": "±0.5"}',
    '{...schema...}',
    3,
    '{"Positive": "Vcc 5V", "Negative": "GND", "Signal": "ADC"}',
    '{"Positive": "5V", "Negative": "GND"}',
    '["arduino-uno", "arduino-nano", "esp32"]',
    '<svg>...</svg>',
    NOW(),
    NOW()
);
```

---

## 🧪 Testing Strategy

### Unit Tests
- Each part's simulation formula (PT1000, pressure, etc.)
- Pin mapping and state updates
- Property validation

### Integration Tests
- Component ↔ pin manager
- Simulation loop with multiple components
- Zustand store updates

### E2E Tests
- Load industrial component library
- Add component to canvas
- Wire to board
- Run simulation
- Verify output values

---

## 📊 Error Detection & AI Tutor

### Validation Checks

```typescript
interface ComponentValidationError {
  componentId: string
  type: 'missing-pin' | 'invalid-wire' | 'unsupported-board' | 'invalid-property'
  severity: 'error' | 'warning' | 'info'
  message: string
  suggestedFix?: string
}

// Example validations:
if (component.pins.signal && !wiresToPin(component.pins.signal).length) {
  errors.push({
    componentId: component.id,
    type: 'missing-pin',
    severity: 'error',
    message: 'PT1000 sensor signal pin is not connected to any ADC pin',
    suggestedFix: 'Wire the "Signal" pin to an analog input (A0-A5)'
  });
}
```

### AI Tutor Integration

```typescript
// Ask Claude about component errors
const response = await fetch('/api/ai/explain-error', {
  method: 'POST',
  body: JSON.stringify({
    error: validationError,
    component: componentMetadata,
    circuit: projectComponents
  })
});

// Returns explanation + suggested fixes
// e.g., "PT1000 sensors need a reference resistor (4.7k pullup) 
//        to convert resistance changes into measurable voltage..."
```

---

## 🚀 Migration Path for Existing Projects

Eski Wokwi projects-ni automatic migrate qilish:

```typescript
// When loading old project:
if (component.tagName === 'wokwi-led') {
  // Convert to industrial-compatible format
  const newComponent = {
    id: UUID(),
    metadata_id: 'led-builtin',
    properties: component.color,
    pin_assignments: mapOldPins(component)
  };
}
```

---

## 📈 Roadmap

### Q2 2026
- ✅ PT1000 + Pressure + Ultrasonic sensors
- ✅ BLDC + H-Bridge controllers
- ✅ Basic simulation logic

### Q3 2026
- ✅ LoRa + Modbus communication
- ✅ Advanced error detection
- ✅ Circuit optimization suggestions

### Q4 2026
- ✅ AI component design assistant
- ✅ Waveform generator (function generator)
- ✅ Advanced power simulation (efficiency models)
- ✅ Real-time telemetry dashboard

---

## 📚 References

- PT1000 Callendar-Van Dusen: https://en.wikipedia.org/wiki/Resistance_thermometer
- 4-20mA standard: IEC 60381-1
- JSN-SR04T datasheet
- SX1276 LoRa datasheet
- Modbus spec: https://modbus.org/

