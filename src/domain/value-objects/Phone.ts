class Phone {
  private _value?: string;

  constructor(value?: string) {
    if (value) {
      this.validate(value);
      this._value = this.format(value);
    }
  }

  private validate(value: string): void {
    // Remove all non-digit characters for validation
    const digits = value.replace(/\D/g, "");

    // Check if it's an international number (starts with +)
    if (value.startsWith("+")) {
      if (digits.length < 8) {
        throw new Error(
          "International phone number must have at least 8 digits"
        );
      }
      if (digits.length > 15) {
        throw new Error("International phone number cannot exceed 15 digits");
      }
    } else {
      // Brazilian number validation
      if (digits.length < 10) {
        throw new Error("Phone number must have at least 10 digits");
      }
      if (digits.length > 11) {
        throw new Error("Phone number cannot exceed 11 digits");
      }
    }
  }

  private format(value: string): string {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // If it's already an international number, return as is
    if (value.startsWith("+")) {
      return value;
    }

    // Format as Brazilian number with country code
    return `+55${digits}`;
  }

  get value(): string | undefined {
    return this._value;
  }

  toJSON(): string | undefined {
    return this._value;
  }
}

export default Phone;
