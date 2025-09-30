/**
 * Interface para conexão com banco de dados
 * Contém métodos essenciais para manipulação de dados
 */
export interface IDatabaseConnection {
  /**
   * Estabelece conexão com o banco de dados
   */
  connect(): Promise<void>;

  /**
   * Fecha a conexão com o banco de dados
   */
  disconnect(): Promise<void>;

  /**
   * Cria um novo registro na tabela
   * @param table - Nome da tabela
   * @param data - Dados a serem inseridos
   * @returns Promise com o registro criado incluindo ID gerado
   */
  create<T>(table: string, data: Omit<T, "id">): Promise<T>;

  /**
   * Busca um registro pelo ID
   * @param table - Nome da tabela
   * @param id - ID do registro
   * @returns Promise com o registro encontrado ou null
   */
  findById<T>(table: string, id: string): Promise<T | null>;

  /**
   * Busca registros por um campo específico
   * @param table - Nome da tabela
   * @param field - Nome do campo
   * @param value - Valor a ser buscado
   * @returns Promise com array de registros encontrados
   */
  findByField<T>(table: string, field: string, value: any): Promise<T[]>;

  /**
   * Busca todos os registros de uma tabela
   * @param table - Nome da tabela
   * @returns Promise com array de todos os registros
   */
  findAll<T>(table: string): Promise<T[]>;

  /**
   * Busca registros com condições específicas
   * @param table - Nome da tabela
   * @param where - Condições de busca
   * @returns Promise com array de registros encontrados
   */
  findMany<T>(table: string, where?: Record<string, any>): Promise<T[]>;

  /**
   * Atualiza um registro pelo ID
   * @param table - Nome da tabela
   * @param id - ID do registro
   * @param data - Dados a serem atualizados
   * @returns Promise com o registro atualizado
   */
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Remove um registro pelo ID
   * @param table - Nome da tabela
   * @param id - ID do registro
   * @returns Promise indicando sucesso
   */
  delete(table: string, id: string): Promise<boolean>;
}

/**
 * Interface for database transaction operations
 */
export interface ITransaction {
  /**
   * Creates a record within the transaction
   */
  create<T>(table: string, data: Omit<T, "id">): Promise<T>;

  /**
   * Finds a record by ID within the transaction
   */
  findById<T>(table: string, id: string): Promise<T | null>;

  /**
   * Updates a record within the transaction
   */
  update<T>(table: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Deletes a record within the transaction
   */
  delete(table: string, id: string): Promise<boolean>;

  /**
   * Commits the transaction
   */
  commit(): Promise<void>;

  /**
   * Rolls back the transaction
   */
  rollback(): Promise<void>;
}

/**
 * Query options for database operations
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  };
  select?: string[];
  include?: Record<string, boolean>;
}

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: "postgresql" | "mysql" | "sqlite" | "mongodb";
  pool?: {
    min: number;
    max: number;
    acquire: number;
    idle: number;
  };
  logging?: boolean;
  ssl?: boolean;
}
