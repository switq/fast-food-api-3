import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import CPF from "../value-objects/CPF";
import Phone from "../value-objects/Phone";

class Customer {
  private _id: string;
  private _name: string;
  private _email: string;
  private _phone?: Phone;
  private _cpf: CPF;

  constructor(
    id: string = uuidv4(),
    name: string,
    email: string,
    cpf: string,
    phone?: string
  ) {
    this.validateId(id);
    this.validateName(name);
    this.validateEmail(email);

    this._id = id;
    this._name = name;
    this._email = email;
    this._cpf = new CPF(cpf);
    this._phone = phone ? new Phone(phone) : undefined;
  }

  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error("Customer ID cannot be empty");
    }
    if (!uuidValidate(id)) {
      throw new Error("Customer ID must be a valid UUID");
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Customer name cannot be empty");
    }
    if (name.length < 3) {
      throw new Error("Customer name must be at least 3 characters long");
    }
    if (name.length > 100) {
      throw new Error("Customer name cannot exceed 100 characters");
    }
  }

  private validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error("Customer email cannot be empty");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get phone(): string | undefined {
    return this._phone?.value;
  }

  get cpf(): string {
    return this._cpf.value;
  }

  // Setters
  set name(name: string) {
    this.validateName(name);
    this._name = name;
  }

  set email(email: string) {
    this.validateEmail(email);
    this._email = email;
  }

  set phone(phone: string | undefined) {
    this._phone = phone ? new Phone(phone) : undefined;
  }

  set cpf(cpf: string) {
    this._cpf = new CPF(cpf);
  }

  // Note: No setter for ID as it should be immutable after creation

  // Utility method to convert to plain object
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      phone: this._phone?.value,
      cpf: this._cpf.value,
    };
  }
}

export default Customer;
