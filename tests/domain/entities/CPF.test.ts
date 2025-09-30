import CPF from "../../../src/domain/value-objects/CPF";

describe("CPF Entity", () => {
  describe("Constructor", () => {
    it("should create a valid CPF instance", () => {
      const cpf = new CPF("123.456.789-09");
      expect(cpf.value).toBe("123.456.789-09");
    });

    it("should format CPF without special characters", () => {
      const cpf = new CPF("12345678909");
      expect(cpf.value).toBe("123.456.789-09");
    });

    it("should throw error for empty CPF", () => {
      expect(() => new CPF("")).toThrow("CPF cannot be empty");
    });

    it("should throw error for CPF with less than 11 digits", () => {
      expect(() => new CPF("1234567890")).toThrow("CPF must have 11 digits");
    });

    it("should throw error for CPF with more than 11 digits", () => {
      expect(() => new CPF("123456789012")).toThrow("CPF must have 11 digits");
    });

    it("should throw error for CPF with all digits the same", () => {
      expect(() => new CPF("111.111.111-11")).toThrow(
        "CPF cannot have all digits the same"
      );
    });

    it("should throw error for invalid CPF check digits", () => {
      expect(() => new CPF("123.456.789-00")).toThrow("Invalid CPF");
    });
  });

  describe("Value Formatting", () => {
    it("should format CPF with dots and dash", () => {
      const cpf = new CPF("12345678909");
      expect(cpf.value).toBe("123.456.789-09");
    });

    it("should handle CPF with mixed special characters", () => {
      const cpf = new CPF("123.456-789/09");
      expect(cpf.value).toBe("123.456.789-09");
    });
  });

  describe("toJSON", () => {
    it("should return formatted CPF value", () => {
      const cpf = new CPF("12345678909");
      expect(cpf.toJSON()).toBe("123.456.789-09");
    });
  });

  describe("Real CPF Examples", () => {
    it("should accept valid real CPF numbers", () => {
      const validCpfs = [
        "529.982.247-25",
        "123.456.789-09",
        "987.654.321-00",
        "111.444.777-35",
      ];

      validCpfs.forEach((cpfNumber) => {
        expect(() => new CPF(cpfNumber)).not.toThrow();
      });
    });

    it("should reject invalid real CPF numbers", () => {
      const invalidCpfs = [
        "123.456.789-01", // Primeiro dígito verificador inválido
        "123.456.789-10", // Segundo dígito verificador inválido
        "123.456.789-11", // Ambos dígitos verificadores inválidos
        "123.456.789-99", // Ambos dígitos verificadores inválidos
      ];

      invalidCpfs.forEach((cpfNumber) => {
        expect(() => new CPF(cpfNumber)).toThrow("Invalid CPF");
      });
    });
  });
});
