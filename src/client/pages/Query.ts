import { createElement as h, Fragment, ReactElement, useState } from "react";
import Api from "../Api";
import { CatchApiError } from "../App";
import UserDefaults from "../UserDefaults";
import Button, { ButtonStyles } from "../components/Button";
import Code from "../components/Code";
import CodeBlock from "../components/CodeBlock";
import Container from "../components/Container";
import CopyToClipboardButton from "../components/CopyToClipboardButton";
import LoadingSpinner from "../components/LoadingSpinner";
import QueryRunMessage from "../components/QueryRunMessage";
import Table from "../components/Table";
import naiveCsvStringify from "../utils/naiveCsvStringify";

const textareaMinHeight = 80;

interface QueryProps {
  initialSql: string;
  replaceSqlInUrl: (sql: string) => void;
  api: Api;
  userDefaults: UserDefaults;
  catchApiError: CatchApiError;
}

const Query = ({
  initialSql,
  replaceSqlInUrl,
  api,
  userDefaults,
  catchApiError,
}: QueryProps): ReactElement => {
  const [sql, setSql] = useState(initialSql);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [requestTime, setRequestTime] = useState(null);
  const [textareaHeight, setTextareaHeight] = useState(
    userDefaults.getQueryTextareaHeight() || textareaMinHeight
  );

  const onChange = (value) => {
    replaceSqlInUrl(value);
    setSql(value);
  };

  const submit = async () => {
    const start = Date.now();
    setLoading(true);
    const queryResult = await catchApiError(api.runSqlQuery(sql));
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
          resizable: true,
          minHeight: textareaMinHeight,
          height: textareaHeight,
          placeholder: "SELECT * FROM example",
          onChange,
          onKeyDown: (event) => {
            if (event.which == 13 && (event.metaKey || event.ctrlKey)) {
              submit();
            }
          },
          onResize: (newHeight) => {
            setTextareaHeight(newHeight);
            userDefaults.setQueryTextareaHeight(newHeight);
          },
        },
        sql
      ),
      h(
        Container,
        { spaceInBetween: true },
        h(
          Button,
          {
            type: "submit",
            disabled: sql === "" || loading,
            style: ButtonStyles.SUCCESS,
          },
          loading ? "Running…" : "Run query"
        ),
        loading && h(LoadingSpinner, { height: 16 })
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
                    .join(" – "),
                  result.returnedRowsAmount > 0 &&
                    h(
                      CopyToClipboardButton,
                      {
                        style: ButtonStyles.GHOST,
                        slim: true,
                        onCopy: () => {
                          return naiveCsvStringify([
                            result.columnNames,
                            ...result.rows,
                          ]);
                        },
                      },
                      `Copy results (csv)`
                    )
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
