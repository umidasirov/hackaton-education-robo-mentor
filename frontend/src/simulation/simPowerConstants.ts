/**
 * Sentinel values returned by getArduinoPinHelper when a pin traces to a
 * power rail (board or 9V battery), not a GPIO number.
 *
 * - SIM_PIN_GND: GND / negative supply (same convention as boardPinToNumber)
 * - SIM_PIN_VCC: fixed logic HIGH (5V/3V3/VIN/battery +)
 */
export const SIM_PIN_GND = -1;
export const SIM_PIN_VCC = -2;
