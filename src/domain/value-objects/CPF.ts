class CPF {
  private _value: string;

  constructor(value: string) {
    this.validate(value);
    this._value = this.format(value);
  }

  private validate(cpf: string): void {
    if (!cpf) {
      throw new Error("CPF cannot be empty");
    }

    // Remove all non-numeric characters
    const cleanCpf = cpf.replace(/\D/g, "");

    if (cleanCpf.length !== 11) {
      throw new Error("CPF must have 11 digits");
    }

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      throw new Error("CPF cannot have all digits the same");
    }

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let rest = 11 - (sum % 11);
    let digit1 = rest > 9 ? 0 : rest;

    if (digit1 !== parseInt(cleanCpf.charAt(9))) {
      throw new Error("Invalid CPF");
    }

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    rest = 11 - (sum % 11);
    let digit2 = rest > 9 ? 0 : rest;

    if (digit2 !== parseInt(cleanCpf.charAt(10))) {
      throw new Error("Invalid CPF");
    }
  }

  private format(cpf: string): string {
    // Remove all non-numeric characters
    const cleanCpf = cpf.replace(/\D/g, "");

    // Format as XXX.XXX.XXX-XX
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  get value(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
}

export default CPF;
