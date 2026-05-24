"""
Basic circuit validation before sending to AI.
Prevents false positive warnings about component damage.
"""

from typing import Optional


class CircuitValidator:
    """
    Checks if a circuit is electrically valid.
    Filters out impossible scenarios before AI analysis.
    """

    # Components that provide protection/safety
    PROTECTION_COMPONENTS = {
        'resistor',
        'wokwi-resistor',
        'capacitor',
        'wokwi-capacitor',
        'diode',
        'wokwi-diode',
    }

    # Output components that might be damaged
    OUTPUT_COMPONENTS = {
        'led',
        'wokwi-led',
        'buzzer',
        'wokwi-buzzer',
        'motor',
        'wokwi-motor',
        'servo',
        'wokwi-servo',
        'led-ring',
        'wokwi-led-ring',
    }

    # Power components
    POWER_COMPONENTS = {
        'arduino-uno',
        'wokwi-arduino-uno',
        'arduino-mega',
        'wokwi-arduino-mega',
        'raspberry-pi-pico',
        'wokwi-pi-pico',
    }

    @staticmethod
    def _get_component_type(comp_type: str) -> str:
        """Normalize component type."""
        return (comp_type or "").lower().strip()

    @classmethod
    def _is_protection_component(cls, comp_type: str) -> bool:
        """Check if component provides electrical protection."""
        normalized = cls._get_component_type(comp_type)
        return normalized in cls.PROTECTION_COMPONENTS

    @classmethod
    def _is_output_component(cls, comp_type: str) -> bool:
        """Check if component can be damaged (LED, motor, etc.)."""
        normalized = cls._get_component_type(comp_type)
        return normalized in cls.OUTPUT_COMPONENTS

    @classmethod
    def _is_power_component(cls, comp_type: str) -> bool:
        """Check if component is a board/power source."""
        normalized = cls._get_component_type(comp_type)
        return normalized in cls.POWER_COMPONENTS

    @classmethod
    def check_led_safety(
        cls,
        components: Optional[list[dict]] = None,
        connections: Optional[list[dict]] = None,
    ) -> list[str]:
        """
        Check if LEDs are properly protected.
        Returns list of actual safety issues (not false positives).
        
        Returns empty list if circuit is safe or if resistor is present.
        """
        if not components or not connections:
            return []

        issues = []
        
        # Build component map
        comp_map = {c.get("id"): c for c in components}
        
        # Find all LEDs
        leds = [c for c in components if cls._is_output_component(c.get("type", ""))]
        
        for led in leds:
            led_id = led.get("id")
            
            # Find all wires connected to this LED
            led_connections = [
                conn for conn in connections
                if conn.get("from") == led_id or conn.get("to") == led_id
            ]
            
            # Check if there's a resistor in the path
            has_protection = False
            for conn in led_connections:
                # Check if connected to resistor
                other_id = conn.get("to") if conn.get("from") == led_id else conn.get("from")
                if other_id and other_id in comp_map:
                    other_comp = comp_map[other_id]
                    if cls._is_protection_component(other_comp.get("type", "")):
                        has_protection = True
                        break
            
            # Only report if LED has NO protection AND is directly from power
            if not has_protection:
                # Check if connected directly to high voltage
                for conn in led_connections:
                    other_id = conn.get("to") if conn.get("from") == led_id else conn.get("from")
                    if other_id == "5V" or other_id == "VCC" or other_id.upper() == "5V":
                        issues.append(f"LED '{led_id}' rezistorsiz 5V ga ulangan bo'lishi mumkin")
        
        return issues

    @classmethod
    def validate_circuit(
        cls,
        components: Optional[list[dict]] = None,
        connections: Optional[list[dict]] = None,
    ) -> dict:
        """
        Full circuit validation.
        
        Returns:
        {
            "is_safe": bool,
            "has_obvious_issues": bool,
            "issues": list[str],
            "needs_ai_check": bool,
        }
        """
        if not components and not connections:
            return {
                "is_safe": True,
                "has_obvious_issues": False,
                "issues": [],
                "needs_ai_check": False,
            }
        
        # Basic checks
        issues = cls.check_led_safety(components, connections)
        
        has_obvious_issues = len(issues) > 0
        is_safe = not has_obvious_issues
        
        # If no obvious issues found, still let AI check (might find subtle problems)
        needs_ai_check = not has_obvious_issues or len(issues) < 3
        
        return {
            "is_safe": is_safe,
            "has_obvious_issues": has_obvious_issues,
            "issues": issues,
            "needs_ai_check": needs_ai_check,
        }
