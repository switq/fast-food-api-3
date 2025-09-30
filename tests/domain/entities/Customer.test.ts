import Customer from "../../../src/domain/entities/Customer";
import { v4 as uuidv4 } from "uuid";

describe("Customer Entity", () => {
  const validUUID = uuidv4();
  const validCustomerData = {
    id: validUUID,
    name: "John Doe",
    email: "john.doe@example.com",
    cpf: "123.456.789-09",
    phone: "11999999999", // Brazilian format
  };

  describe("Constructor", () => {
    it("should create a valid customer instance", () => {
      const customer = new Customer(
        validCustomerData.id,
        validCustomerData.name,
        validCustomerData.email,
        validCustomerData.cpf,
        validCustomerData.phone
      );

      expect(customer.id).toBe(validCustomerData.id);
      expect(customer.name).toBe(validCustomerData.name);
      expect(customer.email).toBe(validCustomerData.email);
      expect(customer.cpf).toBe(validCustomerData.cpf);
      expect(customer.phone).toBe("+55" + validCustomerData.phone); // Phone is formatted with country code
    });

    it("should create a customer without phone", () => {
      const customer = new Customer(
        validCustomerData.id,
        validCustomerData.name,
        validCustomerData.email,
        validCustomerData.cpf
      );

      expect(customer.phone).toBeUndefined();
    });

    it("should generate a new UUID if not provided", () => {
      const customer = new Customer(
        undefined,
        validCustomerData.name,
        validCustomerData.email,
        validCustomerData.cpf
      );

      expect(customer.id).toBeDefined();
      expect(typeof customer.id).toBe("string");
      expect(customer.id.length).toBe(36); // UUID v4 length
    });
  });

  describe("ID Validation", () => {
    it("should throw error for empty ID", () => {
      expect(
        () =>
          new Customer(
            "",
            validCustomerData.name,
            validCustomerData.email,
            validCustomerData.cpf
          )
      ).toThrow("Customer ID cannot be empty");
    });

    it("should throw error for invalid UUID", () => {
      expect(
        () =>
          new Customer(
            "invalid-uuid",
            validCustomerData.name,
            validCustomerData.email,
            validCustomerData.cpf
          )
      ).toThrow("Customer ID must be a valid UUID");
    });
  });

  describe("Name Validation", () => {
    it("should throw error for empty name", () => {
      expect(
        () =>
          new Customer(
            validCustomerData.id,
            "",
            validCustomerData.email,
            validCustomerData.cpf
          )
      ).toThrow("Customer name cannot be empty");
    });

    it("should throw error for name shorter than 3 characters", () => {
      expect(
        () =>
          new Customer(
            validCustomerData.id,
            "Jo",
            validCustomerData.email,
            validCustomerData.cpf
          )
      ).toThrow("Customer name must be at least 3 characters long");
    });

    it("should throw error for name longer than 100 characters", () => {
      const longName = "a".repeat(101);
      expect(
        () =>
          new Customer(
            validCustomerData.id,
            longName,
            validCustomerData.email,
            validCustomerData.cpf
          )
      ).toThrow("Customer name cannot exceed 100 characters");
    });
  });

  describe("Email Validation", () => {
    it("should throw error for empty email", () => {
      expect(
        () =>
          new Customer(
            validCustomerData.id,
            validCustomerData.name,
            "",
            validCustomerData.cpf
          )
      ).toThrow("Customer email cannot be empty");
    });

    it("should throw error for invalid email format", () => {
      const invalidEmails = [
        "invalid-email",
        "invalid@",
        "@invalid.com",
        "invalid@.com",
        "invalid@com.",
        "invalid@.com.",
      ];

      invalidEmails.forEach((email) => {
        expect(
          () =>
            new Customer(
              validCustomerData.id,
              validCustomerData.name,
              email,
              validCustomerData.cpf
            )
        ).toThrow("Invalid email format");
      });
    });
  });

  describe("CPF Validation", () => {
    it("should throw error for invalid CPF", () => {
      expect(
        () =>
          new Customer(
            validCustomerData.id,
            validCustomerData.name,
            validCustomerData.email,
            "123.456.789-01"
          )
      ).toThrow("Invalid CPF");
    });
  });

  describe("Phone Validation", () => {
    it("should accept valid Brazilian phone number", () => {
      const customer = new Customer(
        validCustomerData.id,
        validCustomerData.name,
        validCustomerData.email,
        validCustomerData.cpf,
        "11999999999"
      );

      expect(customer.phone).toBe("+5511999999999");
    });

    it("should accept valid international phone number", () => {
      const customer = new Customer(
        validCustomerData.id,
        validCustomerData.name,
        validCustomerData.email,
        validCustomerData.cpf,
        "+14155552671"
      );

      expect(customer.phone).toBe("+14155552671");
    });

    it("should throw error for invalid phone format", () => {
      const invalidPhones = [
        "123", // Too short
        "abc", // Non-numeric
        "+123", // Too short
        "1234567890123456", // Too long
      ];

      invalidPhones.forEach((phone) => {
        expect(
          () =>
            new Customer(
              validCustomerData.id,
              validCustomerData.name,
              validCustomerData.email,
              validCustomerData.cpf,
              phone
            )
        ).toThrow();
      });
    });
  });

  describe("Setters", () => {
    it("should update name with valid value", () => {
      const customer = new Customer(
        validCustomerData.id,
        validCustomerData.name,
        validCustomerData.email,
        validCustomerData.cpf
      );

      const newName = "Jane Doe";
      customer.name = newName;
      expect(customer.name).toBe(newName);
    });

    it("should update email with valid value", () => {
      const customer = new Customer(
        validCustomerData.id,
        validCustomerData.name,
        validCustomerData.email,
        validCustomerData.cpf
      );

      const newEmail = "jane.doe@example.com";
      customer.email = newEmail;
      expect(customer.email).toBe(newEmail);
    });

    it("should update phone with valid value", () => {
      const customer = new Customer(
        validCustomerData.id,
        validCustomerData.name,
        validCustomerData.email,
        validCustomerData.cpf
      );

      const newPhone = "11988888888";
      customer.phone = newPhone;
      expect(customer.phone).toBe("+5511988888888");
    });

    it("should update CPF with valid value", () => {
      const customer = new Customer(
        validCustomerData.id,
        validCustomerData.name,
        validCustomerData.email,
        validCustomerData.cpf
      );

      const newCpf = "987.654.321-00";
      customer.cpf = newCpf;
      expect(customer.cpf).toBe(newCpf);
    });
  });

  describe("toJSON", () => {
    it("should return customer data as plain object", () => {
      const customer = new Customer(
        validCustomerData.id,
        validCustomerData.name,
        validCustomerData.email,
        validCustomerData.cpf,
        validCustomerData.phone
      );

      const customerData = customer.toJSON();

      expect(customerData).toEqual({
        id: validCustomerData.id,
        name: validCustomerData.name,
        email: validCustomerData.email,
        cpf: validCustomerData.cpf,
        phone: "+55" + validCustomerData.phone,
      });
    });

    it("should return customer data without phone when not provided", () => {
      const customer = new Customer(
        validCustomerData.id,
        validCustomerData.name,
        validCustomerData.email,
        validCustomerData.cpf
      );

      const customerData = customer.toJSON();

      expect(customerData).toEqual({
        id: validCustomerData.id,
        name: validCustomerData.name,
        email: validCustomerData.email,
        cpf: validCustomerData.cpf,
        phone: undefined,
      });
    });
  });
});
