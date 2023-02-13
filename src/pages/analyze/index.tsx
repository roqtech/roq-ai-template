import React, { useState } from "react";
import AppLayout from "layout/app/app.layout";
import { withAuth } from "components/hocs/auth/with-auth";
import styles from "pages/analyze/analyze.module.css";
import { routes } from "routes";
import * as yup from "yup";
import { useFormik } from "formik";
import AppLoader from "../../components/loader";
import Card from "../../components/card";

function AnalyzePage() {
  const [loading, setLoading] = useState(false);

  const [errorText, setErrorText] = useState<string>(null);

  const [response, setResponse] = useState<{
    sql: string;
    columns?: string[];
    sqlResponse?: any[];
  }>(null);

  const validationSchema = yup.object().shape({
    dbConnectionString: yup
      .string()
      .required("Database connection string is required"),
    question: yup.string().required("Question is required"),
  });

  const formik = useFormik({
    initialValues: {
      dbConnectionString: "",
      question: "",
    },
    onSubmit: async (values) => {
      setResponse(null);
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
          if (sqlResponse?.[0]) {
            const columns = Object.keys(sqlResponse[0]);
            setResponse({ columns, sql, sqlResponse });
          } else {
            setResponse({ sql });
          }
        }
      } catch (e) {
        setErrorText((e as Error).message);
      }
      setLoading(false);
    },
    validationSchema,
    validateOnChange: false,
  });

  return (
    <AppLayout>
      <div className={styles.container}>
        <Card>
          {errorText ? <div className="error">{errorText}</div> : <></>}
          {formik.errors.question && (
            <div className="error">{formik.errors.question}</div>
          )}
          {formik.errors.dbConnectionString && (
            <div className="error">{formik.errors.dbConnectionString}</div>
          )}
          <form onSubmit={formik.handleSubmit}>
            <label className="label">
              Provide connection string to your Postgres database:
            </label>
            <input
              className="input"
              name="dbConnectionString"
              defaultValue={formik.values.dbConnectionString}
              onChange={formik.handleChange}
            />
            <label className="label">Provide your question for analyze:</label>
            <input
              className="input"
              name="question"
              defaultValue={formik.values.question}
              onChange={formik.handleChange}
            />

            {loading ? (
              <AppLoader />
            ) : (
              <button style={{ marginTop: 20 }} className="btn" type="submit">
                Analyze
              </button>
            )}
          </form>
          {response && (
            <div style={{ paddingTop: 20, paddingBottom: 10 }}>
              <h2>Generated Sql:</h2>

              <code className="code">{response.sql}</code>
              {response.columns && response.sqlResponse ? (
                <>
                  <h2 style={{ paddingTop: 20, paddingBottom: 10 }}>
                    Response for your question:
                  </h2>
                  <table className="table">
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
              ) : (
                <>
                  <h2 style={{ paddingTop: 20, paddingBottom: 10 }}>
                    Response for your question:
                  </h2>
                  <div>
                    No data found in your database
                  </div>
                </>
              )}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

export default withAuth({
  redirectIfAuthenticated: false,
  redirectTo: "/login",
})(AnalyzePage);
