import { createElement as h, Fragment, useState } from "react";
import CodeBlock from "../components/CodeBlock";
import Container from "../components/Container";
import Table from "../components/Table";
import QueryRunMessage from "../components/QueryRunMessage";
import Code from "../components/Code";
import Button, { ButtonStyles } from "../components/Button";
import { runSqlQuery } from "../api";

const Query = ({ initialSql, replaceSqlInUrl, catchApiError }) => {
  const [sql, setSql] = useState(initialSql);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [requestTime, setRequestTime] = useState(null);

  const onChange = (value) => {
    replaceSqlInUrl(value);
    setSql(value);
  };

  const submit = async () => {
    const start = Date.now();
    setLoading(true);
    const queryResult = await catchApiError(runSqlQuery(sql));
    setLoading(false);
    setResult(queryResult);
    setRequestTime(Date.now() - start);
  };

  return h(
    Fragment,
    null,
    h(
      "form",
      {
        onSubmit: (event) => {
          event.preventDefault();
          submit();
        },
      },
      h(
        CodeBlock,
        {
          editable: true,
          minHeight: 140,
          placeholder: "SELECT * FROM example",
          onChange,
          onKeyDown: (event) => {
            if (event.which == 13 && (event.metaKey || event.ctrlKey)) {
              submit();
            }
          },
        },
        sql
      ),
      h(
        Container,
        null,
        h(
          Button,
          {
            type: "submit",
            disabled: sql === "" || loading,
            style: ButtonStyles.SUCCESS,
          },
          loading ? "Running…" : "Run query"
        )
      ),
      result &&
        h(
          Fragment,
          null,
          h(
            Container,
            null,
            result.errorMessage
              ? h(QueryRunMessage, { danger: true }, result.errorMessage)
              : h(
                  QueryRunMessage,
                  null,
                  [
                    "Success",
                    result.affectedRowsAmount > 0
                      ? `${result.affectedRowsAmount} rows affected`
                      : "",
                    result.returnedRowsAmount > 0 ||
                    result.affectedRowsAmount === 0
                      ? `${result.returnedRowsAmount} rows returned`
                      : "",
                    `${requestTime}ms`,
                  ]
                    .filter((text) => text !== "")
                    .join(" – ")
                )
          ),
          result.returnedRowsAmount > 0 &&
            h(Table, {
              columnTitles: result.columnNames,
              rows: result.rows.map((row) => {
                return row.map((value) =>
                  value === null ? h(Code, null, "NULL") : value
                );
              }),
            })
        )
    )
  );
};

export default Query;
