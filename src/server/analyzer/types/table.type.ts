import { Column } from "./column.type";

export type Table = {
  table_name: string;
  columns: Column[];
};
