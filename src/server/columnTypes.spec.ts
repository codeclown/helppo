import { expect } from "chai";
import { integer, string, text, date, datetime, boolean } from "./columnTypes";

describe("columnTypes", () => {
  describe("integer", () => {
    it("specifies a React component", () => {
      expect(integer.builtInReactComponentName).to.equal("ColumnTypeInteger");
    });

    it("formats value from the database for the client", () => {
      expect(integer.databaseValueToJsonifiable(null)).to.equal(null);
      expect(integer.databaseValueToJsonifiable(123)).to.equal(123);
    });

    it("formats value from the client for the database", () => {
      expect(integer.parsedJsonValueToDatabaseValue(null)).to.equal(null);
      expect(integer.parsedJsonValueToDatabaseValue(123)).to.equal(123);
    });
  });

  describe("string", () => {
    it("specifies a React component", () => {
      expect(string.builtInReactComponentName).to.equal("ColumnTypeString");
    });

    it("formats value from the database for the client", () => {
      expect(string.databaseValueToJsonifiable(null)).to.equal(null);
      expect(string.databaseValueToJsonifiable("foo")).to.equal("foo");
      expect(string.databaseValueToJsonifiable(Buffer.from("foo"))).to.equal(
        "foo"
      );
      expect(string.databaseValueToJsonifiable({ random: "json" })).to.equal(
        '{"random":"json"}'
      );
      expect(string.databaseValueToJsonifiable(["random"])).to.equal(
        '["random"]'
      );
    });

    it("formats value from the client for the database", () => {
      expect(string.parsedJsonValueToDatabaseValue(null)).to.equal(null);
      expect(string.parsedJsonValueToDatabaseValue("foo")).to.equal("foo");
    });
  });

  describe("text", () => {
    it("specifies a React component", () => {
      expect(text.builtInReactComponentName).to.equal("ColumnTypeText");
    });

    it("formats value from the database for the client", () => {
      expect(text.databaseValueToJsonifiable(null)).to.equal(null);
      expect(text.databaseValueToJsonifiable("foo")).to.equal("foo");
      expect(string.databaseValueToJsonifiable(Buffer.from("foo"))).to.equal(
        "foo"
      );
      expect(string.databaseValueToJsonifiable({ random: "json" })).to.equal(
        '{"random":"json"}'
      );
      expect(string.databaseValueToJsonifiable(["random"])).to.equal(
        '["random"]'
      );
    });

    it("formats value from the client for the database", () => {
      expect(text.parsedJsonValueToDatabaseValue(null)).to.equal(null);
      expect(text.parsedJsonValueToDatabaseValue("foo")).to.equal("foo");
    });
  });

  describe("date", () => {
    it("specifies a React component", () => {
      expect(date.builtInReactComponentName).to.equal("ColumnTypeDate");
    });

    it("formats value from the database for the client", () => {
      expect(date.databaseValueToJsonifiable(null)).to.equal(null);
      expect(date.databaseValueToJsonifiable("2020-10-24")).to.equal(
        "2020-10-24"
      );
      expect(
        date.databaseValueToJsonifiable(new Date("2020-10-24T18:15:00"))
      ).to.equal("2020-10-24");
    });

    it("formats value from the client for the database", () => {
      expect(date.parsedJsonValueToDatabaseValue(null)).to.equal(null);
      expect(date.parsedJsonValueToDatabaseValue("2020-10-24")).to.equal(
        "2020-10-24"
      );
    });
  });

  describe("datetime", () => {
    it("specifies a React component", () => {
      expect(datetime.builtInReactComponentName).to.equal("ColumnTypeDateTime");
    });

    it("formats value from the database for the client", () => {
      expect(datetime.databaseValueToJsonifiable(null)).to.equal(null);
      expect(
        datetime.databaseValueToJsonifiable("2020-10-24 18:15:00")
      ).to.equal("2020-10-24 18:15:00");
      expect(
        datetime.databaseValueToJsonifiable(new Date("2020-10-24T18:15:00"))
      ).to.equal("2020-10-24 18:15:00");
    });

    it("formats value from the client for the database", () => {
      expect(datetime.parsedJsonValueToDatabaseValue(null)).to.equal(null);
      expect(
        datetime.parsedJsonValueToDatabaseValue("2020-10-24 18:15:00")
      ).to.equal("2020-10-24 18:15:00");
    });
  });

  describe("boolean", () => {
    it("specifies a React component", () => {
      expect(boolean.builtInReactComponentName).to.equal("ColumnTypeBoolean");
    });

    it("formats value from the database for the client", () => {
      expect(boolean.databaseValueToJsonifiable(null)).to.equal(null);
      expect(boolean.databaseValueToJsonifiable(true)).to.equal(true);
      expect(boolean.databaseValueToJsonifiable(1)).to.equal(true);
      expect(boolean.databaseValueToJsonifiable(0)).to.equal(false);
    });

    it("formats value from the client for the database", () => {
      expect(boolean.parsedJsonValueToDatabaseValue(null)).to.equal(null);
      expect(boolean.parsedJsonValueToDatabaseValue(true)).to.equal(true);
    });
  });
});
