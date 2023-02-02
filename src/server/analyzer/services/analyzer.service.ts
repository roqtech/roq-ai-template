import { SelectResult } from "server/analyzer/types/select-result.type";
import { Column } from "server/analyzer/types/column.type";
import { Table } from "server/analyzer/types/table.type";
import { openaiService } from "server/openai/services/openai.service";
import { DatabaseConnectionError } from "server/errors/database-connection.error";
import { OpenaiError } from "server/errors/openai.error";
import { DatabaseQueryError } from "../../errors/database-query.error";

export class AnalyzerService {
  private pg: any;
  constructor(connectionString: string) {
    try {
      this.pg = require("knex")({
        client: "pg",
        connection: connectionString,
        searchPath: ["knex", "public"],
      });
    } catch (err) {
      throw new DatabaseConnectionError();
    }
  }

  async analyzeDatabase(): Promise<Table[]> {
    const tablesInfo: Table[] = [];

    const tables = await this.pg
      .raw(
        `SELECT table_name 
    FROM information_schema.tables 
WHERE table_type = 'BASE TABLE' 
    AND table_schema NOT IN 
        ('pg_catalog', 'information_schema'); `
      )
      .then((r: SelectResult) => r.rows);

    for (let table of tables) {
      const columns: Column[] = await this.pg
        .raw(
          `SELECT column_name 
    FROM information_schema.columns 
WHERE table_name = '${table.table_name}'; `
        )
        .then((r: SelectResult) => r.rows);

      tablesInfo.push({
        table_name: table.table_name,
        columns,
      });
    }
    return tablesInfo;
  }

  async generateSql(question: string, tablesInfo: Table[]) {
    let dbPrompt = `### Postgres SQL tables, with their properties:
#
`;

    for (let tableInfo of tablesInfo) {
      dbPrompt += `# ${tableInfo.table_name}(${tableInfo.columns
        .map((column: Column) => column.column_name)
        .join(", ")}) `;
    }
    dbPrompt += `#`;

    const prompt = `
  ${dbPrompt}
  ### Generate psql query with column and table names wrapped in double quotes for ${question}
  `;

    try {
      const response = await openaiService.createCompletion({
        model: "text-davinci-003",
        prompt,
        temperature: 0,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: ["#", ";"],
      });
      return response?.data?.choices[0]?.text;
    } catch (err) {
      console.error(err);
      throw new OpenaiError();
    }
  }

  async executeSql(sql: string) {
    try {
      return this.pg.raw(sql).then((r: SelectResult) => r.rows);
    } catch (err) {
      console.error(err);
      throw new DatabaseQueryError();
    }
  }

  destroy() {
    this.pg.destroy();
  }
}
