"""
Industrial Components Model

Defines metadata and instances for advanced industrial sensors, motor drivers,
and communication modules.
"""

from sqlalchemy import Column, String, Integer, Float, JSON, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Dict, List, Any, Optional
from enum import Enum

from app.database.base import Base


class ComponentCategory(str, Enum):
    """Component categories for filtering and organization."""
    INDUSTRIAL_SENSOR = "industrial-sensor"
    MOTOR_DRIVER = "motor-driver"
    POWER_ELECTRONICS = "power-electronics"
    COMMUNICATION = "communication"
    DISPLAY = "display"
    OTHER = "other"


class SimulationType(str, Enum):
    """Type of simulation logic needed."""
    ANALOG_SENSOR = "analog-sensor"
    PWM_CONTROLLER = "pwm-controller"
    PROTOCOL = "protocol"
    POWER_DEVICE = "power-device"
    MEASUREMENT = "measurement"


class ComponentMetadata(Base):
    """
    Component metadata - defines the properties, pins, and behavior of a component type.
    
    Loaded at startup from a JSON registry or database.
    Multiple component instances can reference the same metadata.
    """
    __tablename__ = "component_metadata"
    
    # Identity
    id = Column(String(128), primary_key=True)  # e.g., "pt1000-temperature"
    name = Column(String(256), nullable=False)
    description = Column(Text)
    category = Column(String(64), nullable=False, default=ComponentCategory.OTHER.value)
    
    # Categorization
    tags = Column(JSON, default=list)  # ["temperature", "sensor", "rtd", "industrial"]
    
    # Simulation
    simulation_type = Column(String(64), nullable=False)  # "analog-sensor", "pwm-controller", etc.
    
    # Default property values (can be overridden per instance)
    default_properties = Column(JSON, default=dict)  # {"minTemp": -50, "maxTemp": 100}
    
    # JSON Schema for property validation
    property_schema = Column(JSON, default=dict)
    
    # Pin configuration
    pin_count = Column(Integer, nullable=False)
    pin_descriptions = Column(JSON, default=dict)  # {"Positive": "Vcc 5V", "Negative": "GND", ...}
    default_pin_connections = Column(JSON, default=dict)  # {"Positive": "5V", "Negative": "GND"}
    
    # Compatibility
    supported_boards = Column(JSON, default=list)  # ["arduino-uno", "arduino-nano", "esp32", ...]
    
    # UI
    thumbnail_svg = Column(Text)  # Inline SVG or base64 data URL
    requires_library = Column(String(256))  # Optional: required Arduino library name
    
    # Metadata timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    instances = relationship("ComponentInstance", back_populates="metadata")
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize metadata to dict for API response."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "tags": self.tags,
            "simulation_type": self.simulation_type,
            "default_properties": self.default_properties,
            "property_schema": self.property_schema,
            "pin_count": self.pin_count,
            "pin_descriptions": self.pin_descriptions,
            "default_pin_connections": self.default_pin_connections,
            "supported_boards": self.supported_boards,
            "thumbnail_svg": self.thumbnail_svg,
            "requires_library": self.requires_library,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class ComponentInstance(Base):
    """
    Component instance - a specific placement of a component in a project.
    
    References ComponentMetadata for behavior/properties.
    Can have instance-specific overrides.
    """
    __tablename__ = "component_instances"
    
    id = Column(String(36), primary_key=True)  # UUID
    
    # Foreign keys
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    metadata_id = Column(String(128), ForeignKey("component_metadata.id"), nullable=False)
    
    # Canvas position & orientation
    position_x = Column(Float, default=0.0)
    position_y = Column(Float, default=0.0)
    rotation = Column(Integer, default=0)  # 0, 90, 180, 270
    
    # Instance-specific property overrides
    # Merged with metadata.default_properties at runtime
    properties = Column(JSON, default=dict)
    
    # Initial simulation state (populated at start-of-run)
    initial_state = Column(JSON, default=dict)  # {"temperature": 20.5, "humidity": 45}
    
    # Pin assignments: {pin_name: arduino_pin_number}
    # e.g., {"Positive": 5, "Negative": -1, "Signal": 14}
    # -1 or absent = not connected
    pin_assignments = Column(JSON, default=dict)
    
    # Runtime simulation state (transient, not persisted)
    runtime_data = Column(JSON, default=dict)  # {"current_voltage": 3.5, "last_update": 12345}
    
    # Optional: label/name for the component on canvas
    label = Column(String(256))
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    metadata = relationship("ComponentMetadata", back_populates="instances")
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize instance to dict for API response."""
        return {
            "id": self.id,
            "project_id": self.project_id,
            "metadata_id": self.metadata_id,
            "position_x": self.position_x,
            "position_y": self.position_y,
            "rotation": self.rotation,
            "properties": self.properties,
            "initial_state": self.initial_state,
            "pin_assignments": self.pin_assignments,
            "runtime_data": self.runtime_data,
            "label": self.label,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
    
    def merge_properties(self) -> Dict[str, Any]:
        """Get merged properties: metadata defaults + instance overrides."""
        merged = dict(self.metadata.default_properties or {})
        merged.update(self.properties or {})
        return merged


# Component metadata registry (pre-defined components)
INDUSTRIAL_COMPONENTS_REGISTRY: List[Dict[str, Any]] = [
    {
        "id": "pt1000-temperature",
        "name": "PT1000 Temperature Sensor",
        "description": "Industrial RTD temperature sensor using Callendar-Van Dusen equation. Outputs resistance 0Ω-4000Ω.",
        "category": ComponentCategory.INDUSTRIAL_SENSOR.value,
        "tags": ["temperature", "sensor", "rtd", "industrial", "pt1000"],
        "simulation_type": SimulationType.ANALOG_SENSOR.value,
        "default_properties": {
            "minTemp": -50,
            "maxTemp": 100,
            "accuracy": "±0.5",
            "R0": 1000,  # Base resistance at 0°C
            "A": 0.00385,  # Callendar coefficient
        },
        "property_schema": {
            "type": "object",
            "properties": {
                "minTemp": {"type": "number", "minimum": -60, "maximum": 200},
                "maxTemp": {"type": "number", "minimum": -60, "maximum": 200},
                "accuracy": {"type": "string", "enum": ["±0.5", "±1.0", "±2.0"]},
            }
        },
        "pin_count": 3,
        "pin_descriptions": {
            "Positive": "Vcc (5V)",
            "Negative": "GND",
            "Signal": "ADC pin (0-1023)"
        },
        "default_pin_connections": {
            "Positive": "5V",
            "Negative": "GND"
        },
        "supported_boards": ["arduino-uno", "arduino-nano", "arduino-mega", "esp32"],
        "thumbnail_svg": '<svg width="64" height="64"><rect width="64" height="64" rx="4" fill="#E8F4F8"/><circle cx="32" cy="32" r="20" fill="#2196F3"/><text x="32" y="36" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Pt1k</text></svg>',
    },
    {
        "id": "pressure-4-20ma",
        "name": "4–20mA Industrial Pressure Sensor",
        "description": "Industrial pressure sensor with 4-20mA output. Outputs 1-5V on reference resistor (250Ω).",
        "category": ComponentCategory.INDUSTRIAL_SENSOR.value,
        "tags": ["pressure", "sensor", "4-20ma", "industrial", "transducer"],
        "simulation_type": SimulationType.ANALOG_SENSOR.value,
        "default_properties": {
            "pressureMin": 0,
            "pressureMax": 10,
            "unit": "bar",
            "referenceResistance": 250,  # Ω (1-5V output)
        },
        "property_schema": {
            "type": "object",
            "properties": {
                "pressureMin": {"type": "number", "minimum": 0},
                "pressureMax": {"type": "number", "minimum": 0},
                "unit": {"type": "string", "enum": ["bar", "psi", "pascal"]},
            }
        },
        "pin_count": 3,
        "pin_descriptions": {
            "Positive": "12V power input",
            "Negative": "GND",
            "Signal": "ADC (1-5V)"
        },
        "default_pin_connections": {
            "Positive": "12V",
            "Negative": "GND"
        },
        "supported_boards": ["arduino-uno", "arduino-nano", "arduino-mega", "esp32"],
        "thumbnail_svg": '<svg width="64" height="64"><rect width="64" height="64" rx="4" fill="#FFF3E0"/><rect x="16" y="14" width="32" height="36" rx="2" fill="#FF9800"/><text x="32" y="38" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">4-20mA</text></svg>',
    },
    {
        "id": "ultrasonic-waterproof-sr04t",
        "name": "Ultrasonic Sensor (JSN-SR04T Waterproof)",
        "description": "Waterproof ultrasonic range sensor for distance measurement (30-450cm). TRIG pulse (10µs) → ECHO pulse duration.",
        "category": ComponentCategory.INDUSTRIAL_SENSOR.value,
        "tags": ["ultrasonic", "distance", "waterproof", "sr04t", "sensor"],
        "simulation_type": SimulationType.MEASUREMENT.value,
        "default_properties": {
            "minDistance": 30,  # cm
            "maxDistance": 450,  # cm
            "measurementRate": 50,  # ms
        },
        "property_schema": {
            "type": "object",
            "properties": {
                "minDistance": {"type": "number", "minimum": 0},
                "maxDistance": {"type": "number", "minimum": 0},
                "measurementRate": {"type": "number", "minimum": 10},
            }
        },
        "pin_count": 4,
        "pin_descriptions": {
            "VCC": "5V power",
            "GND": "Ground",
            "TRIG": "Trigger pulse input (10µs)",
            "ECHO": "Echo pulse output (proportional to distance)"
        },
        "default_pin_connections": {
            "VCC": "5V",
            "GND": "GND"
        },
        "supported_boards": ["arduino-uno", "arduino-nano", "arduino-mega", "esp32"],
        "thumbnail_svg": '<svg width="64" height="64"><rect width="64" height="64" rx="4" fill="#E8F5E9"/><circle cx="32" cy="24" r="12" fill="#4CAF50" opacity="0.7"/><polygon points="20,32 44,32 32,44" fill="#4CAF50"/><text x="32" y="55" text-anchor="middle" fill="#4CAF50" font-size="8" font-weight="bold">JSN-SR04</text></svg>',
    },
    {
        "id": "gas-detector-industrial",
        "name": "Industrial Gas Detector",
        "description": "Detects gases (CO, CO₂, LPG, Methane) and outputs PPM (parts per million) as ADC voltage.",
        "category": ComponentCategory.INDUSTRIAL_SENSOR.value,
        "tags": ["gas", "detector", "safety", "ppm", "industrial"],
        "simulation_type": SimulationType.ANALOG_SENSOR.value,
        "default_properties": {
            "gasType": "CO",  # CO, CO2, LPG, CH4
            "minPPM": 0,
            "maxPPM": 10000,
            "detectionThreshold": 50,  # Alert level in PPM
        },
        "property_schema": {
            "type": "object",
            "properties": {
                "gasType": {"type": "string", "enum": ["CO", "CO2", "LPG", "CH4", "NH3"]},
                "minPPM": {"type": "number", "minimum": 0},
                "maxPPM": {"type": "number", "minimum": 0},
                "detectionThreshold": {"type": "number", "minimum": 0},
            }
        },
        "pin_count": 3,
        "pin_descriptions": {
            "Positive": "5V power",
            "Negative": "GND",
            "Signal": "ADC output (PPM)"
        },
        "default_pin_connections": {
            "Positive": "5V",
            "Negative": "GND"
        },
        "supported_boards": ["arduino-uno", "arduino-nano", "arduino-mega", "esp32"],
        "thumbnail_svg": '<svg width="64" height="64"><rect width="64" height="64" rx="4" fill="#FFEBEE"/><rect x="14" y="14" width="36" height="36" rx="3" fill="#F44336"/><circle cx="20" cy="20" r="3" fill="#fff"/><circle cx="32" cy="20" r="3" fill="#fff"/><circle cx="44" cy="20" r="3" fill="#fff"/><text x="32" y="50" text-anchor="middle" fill="#F44336" font-size="8" font-weight="bold">GAS</text></svg>',
    },
    {
        "id": "optical-encoder",
        "name": "Optical Encoder (Rotary Position)",
        "description": "Detects rotation angle and speed. Generates pulse train on rotation (CPR: counts per revolution).",
        "category": ComponentCategory.INDUSTRIAL_SENSOR.value,
        "tags": ["encoder", "rotary", "position", "speed", "motor"],
        "simulation_type": SimulationType.MEASUREMENT.value,
        "default_properties": {
            "CPR": 600,  # Counts per revolution
            "minRPM": 0,
            "maxRPM": 3000,
            "pulseType": "quadrature",  # quadrature, single-line
        },
        "property_schema": {
            "type": "object",
            "properties": {
                "CPR": {"type": "number", "minimum": 1},
                "minRPM": {"type": "number", "minimum": 0},
                "maxRPM": {"type": "number", "minimum": 0},
                "pulseType": {"type": "string", "enum": ["quadrature", "single-line"]},
            }
        },
        "pin_count": 3,
        "pin_descriptions": {
            "Positive": "5V power",
            "Negative": "GND",
            "Pulse": "Digital output (interrupt-capable)"
        },
        "default_pin_connections": {
            "Positive": "5V",
            "Negative": "GND"
        },
        "supported_boards": ["arduino-uno", "arduino-nano", "arduino-mega", "esp32"],
        "thumbnail_svg": '<svg width="64" height="64"><rect width="64" height="64" rx="4" fill="#F3E5F5"/><circle cx="32" cy="32" r="18" fill="#9C27B0" opacity="0.3"/><circle cx="32" cy="32" r="14" fill="none" stroke="#9C27B0" stroke-width="2"/><polygon points="32,18 38,28 26,28" fill="#9C27B0"/><text x="32" y="50" text-anchor="middle" fill="#9C27B0" font-size="8" font-weight="bold">ENC</text></svg>',
    },
    {
        "id": "bldc-controller-esc",
        "name": "BLDC Motor Controller (ESC 30-50A)",
        "description": "Electronic Speed Controller for brushless DC motors. PWM input (1000-2000µs) controls speed and direction.",
        "category": ComponentCategory.MOTOR_DRIVER.value,
        "tags": ["bldc", "esc", "motor", "brushless", "controller"],
        "simulation_type": SimulationType.PWM_CONTROLLER.value,
        "default_properties": {
            "minThrottle": 1000,  # µs
            "maxThrottle": 2000,  # µs
            "polarity": "normal",  # normal, reversed
            "maxRPM": 10000,
            "maxCurrent": 50,  # Amperes
            "voltage": 12,  # Nominal voltage
        },
        "property_schema": {
            "type": "object",
            "properties": {
                "minThrottle": {"type": "number", "minimum": 500, "maximum": 1500},
                "maxThrottle": {"type": "number", "minimum": 1500, "maximum": 2500},
                "polarity": {"type": "string", "enum": ["normal", "reversed"]},
                "maxRPM": {"type": "number", "minimum": 1000},
                "maxCurrent": {"type": "number", "minimum": 5},
            }
        },
        "pin_count": 5,
        "pin_descriptions": {
            "Signal": "PWM input (1-2ms pulse)",
            "Power+": "Battery positive",
            "Power-": "Battery negative",
            "GND": "Signal ground",
            "Feedback": "RPM feedback (optional)"
        },
        "default_pin_connections": {
            "GND": "GND"
        },
        "supported_boards": ["arduino-uno", "arduino-nano", "arduino-mega", "esp32"],
        "thumbnail_svg": '<svg width="64" height="64"><rect width="64" height="64" rx="4" fill="#E0F2F1"/><rect x="12" y="18" width="40" height="28" rx="3" fill="#00897B"/><rect x="16" y="14" width="6" height="8" fill="#00897B"/><rect x="42" y="14" width="6" height="8" fill="#00897B"/><text x="32" y="40" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">ESC</text></svg>',
    },
    {
        "id": "h-bridge-industrial",
        "name": "Industrial H-Bridge (BTS7960 / VNH2SP30)",
        "description": "30-50A high-current H-bridge for DC motor control. PWM + direction pins for forward/reverse/brake.",
        "category": ComponentCategory.MOTOR_DRIVER.value,
        "tags": ["h-bridge", "motor-driver", "industrial", "pwm", "direction"],
        "simulation_type": SimulationType.PWM_CONTROLLER.value,
        "default_properties": {
            "maxCurrent": 50,  # Amperes
            "maxVoltage": 24,  # Volts
            "rdsOn": 0.019,  # On-state resistance (Ω)
        },
        "property_schema": {
            "type": "object",
            "properties": {
                "maxCurrent": {"type": "number", "minimum": 10},
                "maxVoltage": {"type": "number", "minimum": 5},
                "rdsOn": {"type": "number", "minimum": 0.001},
            }
        },
        "pin_count": 6,
        "pin_descriptions": {
            "Power+": "Supply voltage (12-24V)",
            "Power-": "Ground",
            "PWM": "PWM signal input",
            "DIR": "Direction control",
            "EN": "Enable pin",
            "GND": "Signal ground"
        },
        "default_pin_connections": {
            "Power-": "GND",
            "GND": "GND"
        },
        "supported_boards": ["arduino-uno", "arduino-nano", "arduino-mega", "esp32"],
        "thumbnail_svg": '<svg width="64" height="64"><rect width="64" height="64" rx="4" fill="#FCE4EC"/><rect x="10" y="12" width="44" height="40" rx="2" fill="#E91E63"/><line x1="16" y1="22" x2="48" y2="22" stroke="#fff" stroke-width="2"/><line x1="16" y1="32" x2="48" y2="32" stroke="#fff" stroke-width="2"/><line x1="16" y1="42" x2="48" y2="42" stroke="#fff" stroke-width="2"/><text x="32" y="57" text-anchor="middle" fill="#E91E63" font-size="8" font-weight="bold">HBR</text></svg>',
    },
    {
        "id": "dcdc-converter",
        "name": "DC-DC Converter (12V→5V, 20A)",
        "description": "Step-down converter with efficiency model. Input 12V, Output 5V @ 20A. Simulates ripple and dropout.",
        "category": ComponentCategory.POWER_ELECTRONICS.value,
        "tags": ["dcdc", "converter", "power", "buck", "regulator"],
        "simulation_type": SimulationType.POWER_DEVICE.value,
        "default_properties": {
            "inputVoltage": 12,  # V
            "outputVoltage": 5,  # V
            "maxCurrent": 20,  # A
            "efficiency": 0.95,  # 95%
            "ripple": 0.05,  # 50mV ripple
        },
        "property_schema": {
            "type": "object",
            "properties": {
                "inputVoltage": {"type": "number", "minimum": 5},
                "outputVoltage": {"type": "number", "minimum": 1},
                "maxCurrent": {"type": "number", "minimum": 1},
                "efficiency": {"type": "number", "minimum": 0.5, "maximum": 1.0},
            }
        },
        "pin_count": 4,
        "pin_descriptions": {
            "Input+": "12V input",
            "Input-": "Ground",
            "Output+": "5V output",
            "Output-": "Ground"
        },
        "default_pin_connections": {
            "Input-": "GND",
            "Output-": "GND"
        },
        "supported_boards": ["arduino-uno", "arduino-nano", "arduino-mega", "esp32"],
        "thumbnail_svg": '<svg width="64" height="64"><rect width="64" height="64" rx="4" fill="#ECEFF1"/><rect x="12" y="20" width="40" height="24" rx="2" fill="#455A64"/><rect x="14" y="22" width="12" height="5" fill="#00C853"/><rect x="38" y="22" width="12" height="5" fill="#00C853"/><text x="32" y="40" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">DCDC</text></svg>',
    },
    {
        "id": "lora-sx1276",
        "name": "LoRa Module (SX1276 868MHz)",
        "description": "Long-range wireless communication (1-10km). SPI interface. Simulates packet TX/RX with SNR/RSSI.",
        "category": ComponentCategory.COMMUNICATION.value,
        "tags": ["lora", "sx1276", "wireless", "communication", "iot"],
        "simulation_type": SimulationType.PROTOCOL.value,
        "default_properties": {
            "frequency": "868",  # MHz
            "bandwidth": "125",  # kHz
            "spreadingFactor": 7,  # SF7-SF12
            "codingRate": "4/5",
            "txPower": 17,  # dBm
        },
        "property_schema": {
            "type": "object",
            "properties": {
                "frequency": {"type": "string", "enum": ["433", "868", "915"]},
                "bandwidth": {"type": "string", "enum": ["125", "250", "500"]},
                "spreadingFactor": {"type": "integer", "minimum": 7, "maximum": 12},
                "codingRate": {"type": "string", "enum": ["4/5", "4/6", "4/7", "4/8"]},
                "txPower": {"type": "integer", "minimum": -17, "maximum": 20},
            }
        },
        "pin_count": 8,
        "pin_descriptions": {
            "VCC": "3.3V power",
            "GND": "Ground",
            "MISO": "SPI Master-In (GPIO 12)",
            "MOSI": "SPI Master-Out (GPIO 11)",
            "SCK": "SPI Clock (GPIO 13)",
            "CS": "Chip Select (GPIO 10)",
            "RST": "Reset pin",
            "DIO0": "Interrupt (packet arrival)"
        },
        "default_pin_connections": {
            "VCC": "3.3V",
            "GND": "GND"
        },
        "supported_boards": ["arduino-uno", "arduino-nano", "esp32"],
        "thumbnail_svg": '<svg width="64" height="64"><rect width="64" height="64" rx="4" fill="#E3F2FD"/><rect x="14" y="16" width="36" height="32" rx="2" fill="#1976D2"/><rect x="18" y="20" width="28" height="2" fill="#1976D2"/><path d="M24 30 Q30 28 36 30" stroke="#fff" stroke-width="1.5" fill="none"/><text x="32" y="52" text-anchor="middle" fill="#1976D2" font-size="8" font-weight="bold">LoRa</text></svg>',
    },
    {
        "id": "modbus-gateway",
        "name": "Industrial Modbus Gateway (RS485)",
        "description": "RS485 Modbus node for legacy industrial systems. Converts Arduino UART to Modbus RTU protocol.",
        "category": ComponentCategory.COMMUNICATION.value,
        "tags": ["modbus", "rs485", "industrial", "protocol", "gateway"],
        "simulation_type": SimulationType.PROTOCOL.value,
        "default_properties": {
            "baudRate": 9600,  # bps
            "modbusAddress": 1,  # 1-247
            "parity": "even",  # none, even, odd
            "protocol": "modbus-rtu",
        },
        "property_schema": {
            "type": "object",
            "properties": {
                "baudRate": {"type": "integer", "enum": [9600, 14400, 19200, 38400]},
                "modbusAddress": {"type": "integer", "minimum": 1, "maximum": 247},
                "parity": {"type": "string", "enum": ["none", "even", "odd"]},
            }
        },
        "pin_count": 4,
        "pin_descriptions": {
            "Positive": "5-12V power",
            "Negative": "GND",
            "TX": "UART TX (GPIO 1)",
            "RX": "UART RX (GPIO 0)"
        },
        "default_pin_connections": {
            "Positive": "5V",
            "Negative": "GND"
        },
        "supported_boards": ["arduino-uno", "arduino-nano", "arduino-mega"],
        "thumbnail_svg": '<svg width="64" height="64"><rect width="64" height="64" rx="4" fill="#FFF3E0"/><rect x="12" y="18" width="40" height="28" rx="2" fill="#FF9800"/><rect x="16" y="22" width="32" height="4" fill="#fff"/><rect x="16" y="28" width="32" height="4" fill="#fff"/><rect x="16" y="34" width="32" height="4" fill="#fff"/><text x="32" y="53" text-anchor="middle" fill="#FF9800" font-size="8" font-weight="bold">MODBUS</text></svg>',
    }
]
