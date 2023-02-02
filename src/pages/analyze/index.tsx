import { useState } from "react";
import AppLayout from "layout/app/app.layout";
import { withAuth } from "components/hocs/auth/with-auth";
import styles from "pages/analyze/analyze.module.css";
import { routes } from "routes";
import * as yup from "yup";
import { useFormik } from "formik";

function AnalyzePage() {
  const [loading, setLoading] = useState(false);

  const [errorText, setErrorText] = useState<string>(null);

  const [response, setResponse] = useState<{
    sql: string;
    columns: string[];
    sqlResponse: any[];
  }>(null);

  const validationSchema = yup.object().shape({
    dbConnectionString: yup.string().required(),
    question: yup.string().required(),
  });

  const formik = useFormik({
    initialValues: {
      dbConnectionString: "",
      question: "",
    },
    onSubmit: async (values) => {
      setErrorText(null);
      setLoading(true);
      try {
        const { question, dbConnectionString } = values;
        const result = await fetch(routes.server.analyze, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, dbConnectionString }),
        }).then((r) => r.json());
        if (result.error) {
          setErrorText(result?.error?.message);
        } else {
          const { sql, sqlResponse } = result;
          const columns = Object.keys(sqlResponse[0]);
          setResponse({ columns, sql, sqlResponse });
        }
      } catch (e) {
        setErrorText((e as Error).message);
      }
      setLoading(false);
    },
    validationSchema,
    validateOnChange: true,
  });

  return (
    <AppLayout>
      <div className={styles.container}>
        <form onSubmit={formik.handleSubmit}>
          <label>Provide connection string to your Postgres database</label>
          <input
            name="dbConnectionString"
            defaultValue={formik.values.dbConnectionString}
            onChange={formik.handleChange}
          />
          {formik.errors.dbConnectionString && (
            <div>{formik.errors.dbConnectionString}</div>
          )}
          <label>Provide your question for analyze</label>
          <input
            name="question"
            defaultValue={formik.values.question}
            onChange={formik.handleChange}
          />
          {formik.errors.question && <div>{formik.errors.question}</div>}
          {loading ? (
            <div>Loading</div>
          ) : (
            <button type="submit">Analyze</button>
          )}
          {errorText ? <div>{errorText}</div> : <></>}
        </form>
        {response && (
          <>
            <div>Generated Sql</div>

            <div>{response.sql}</div>

            <div>{formik.values.question}</div>

            <table>
              <tr>
                {response.columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
              {response.sqlResponse.map((row, i) => (
                <tr key={i}>
                  {response.columns.map((column) => (
                    <td key={column}>{row[column]}</td>
                  ))}
                </tr>
              ))}
            </table>
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default withAuth({
  redirectIfAuthenticated: false,
  redirectTo: "/login",
})(AnalyzePage);
