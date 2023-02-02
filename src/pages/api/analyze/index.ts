import type { NextApiRequest, NextApiResponse } from "next";
import { AnalyzerService } from "server/analyzer/services/analyzer.service";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "Method not allowed" } });
    res.end();
  }

  try {
    const analyzerService = new AnalyzerService(req.body.dbConnectionString);
    const tablesInfo = await analyzerService.analyzeDatabase();
    const sql = await analyzerService.generateSql(
      req.body.question,
      tablesInfo
    );
    const sqlResponse = await analyzerService.executeSql(sql);
    analyzerService.destroy();
    res.status(200).json({ tablesInfo, sql, sqlResponse });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ error: { message: err.message } });
    }
  }
}
