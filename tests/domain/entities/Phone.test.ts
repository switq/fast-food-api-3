import Phone from "../../../src/domain/value-objects/Phone";

describe("Phone Entity", () => {
  describe("Constructor", () => {
    it("should create a valid phone instance with Brazilian number", () => {
      const phone = new Phone("11999999999");
      expect(phone.value).toBe("+5511999999999");
    });

    it("should create a valid phone instance with international number", () => {
      const phone = new Phone("+14155552671");
      expect(phone.value).toBe("+14155552671");
    });

    it("should create an undefined phone instance when no value is provided", () => {
      const phone = new Phone();
      expect(phone.value).toBeUndefined();
    });
  });

  describe("Brazilian Phone Validation", () => {
    it("should accept valid mobile number", () => {
      const phone = new Phone("11999999999");
      expect(phone.value).toBe("+5511999999999");
    });

    it("should accept valid landline number", () => {
      const phone = new Phone("1133333333");
      expect(phone.value).toBe("+551133333333");
    });

    it("should throw error for number shorter than 10 digits", () => {
      expect(() => new Phone("123456789")).toThrow(
        "Phone number must have at least 10 digits"
      );
    });

    it("should throw error for number longer than 11 digits", () => {
      expect(() => new Phone("123456789012")).toThrow(
        "Phone number cannot exceed 11 digits"
      );
    });
  });

  describe("International Phone Validation", () => {
    it("should accept valid international number", () => {
      const phone = new Phone("+14155552671");
      expect(phone.value).toBe("+14155552671");
    });

    it("should throw error for international number shorter than 8 digits", () => {
      expect(() => new Phone("+1234567")).toThrow(
        "International phone number must have at least 8 digits"
      );
    });

    it("should throw error for international number longer than 15 digits", () => {
      expect(() => new Phone("+1234567890123456")).toThrow(
        "International phone number cannot exceed 15 digits"
      );
    });
  });

  describe("Formatting", () => {
    it("should format Brazilian number with country code", () => {
      const phone = new Phone("11999999999");
      expect(phone.value).toBe("+5511999999999");
    });

    it("should keep international format as is", () => {
      const phone = new Phone("+14155552671");
      expect(phone.value).toBe("+14155552671");
    });

    it("should handle numbers with special characters", () => {
      const phone = new Phone("(11) 99999-9999");
      expect(phone.value).toBe("+5511999999999");
    });
  });

  describe("toJSON", () => {
    it("should return formatted phone value", () => {
      const phone = new Phone("11999999999");
      expect(phone.toJSON()).toBe("+5511999999999");
    });

    it("should return undefined when no value is provided", () => {
      const phone = new Phone();
      expect(phone.toJSON()).toBeUndefined();
    });
  });
});
