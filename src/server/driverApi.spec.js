import { expect } from "chai";
import supertest from "supertest";
import driverApi from "./driverApi";

const baseDriver = {
  getSchema: async () => {
    return {
      tables: [],
    };
  },
  getTableRows: async () => {
    return [];
  },
  saveRow: async () => {
    return {};
  },
};

describe("driverApi", () => {
  describe("error handling", () => {
    it("returns 404 response", async () => {
      const app = driverApi({ driver: baseDriver });
      const request = supertest(app);
      const response = await request.get("/foobar123");
      expect(response.status).to.deep.equal(404);
      expect(response.body).to.deep.equal({
        error: {
          message: "Endpoint not found",
        },
      });
    });

    it("returns 500 response", async () => {
      let errorHandlerCalledWith;
      const mockedReturnValue = "__mockedReturnValue__";
      const errorHandler = (...args) => {
        errorHandlerCalledWith = args;
        return mockedReturnValue;
      };
      const app = driverApi({
        driver: baseDriver,
        throwErrorOnPurpose: true,
        errorHandler,
      });
      const request = supertest(app);
      const response = await request.get("/foobar123");
      expect(response.status).to.deep.equal(500);
      expect(response.body).to.deep.equal({
        error: {
          message: mockedReturnValue,
        },
      });
      expect(errorHandlerCalledWith).to.have.length(1);
      expect(errorHandlerCalledWith[0]).to.be.an("error");
      expect(errorHandlerCalledWith[0].message).to.equal(
        "This error was thrown for testing purposes from driverApi"
      );
    });
  });

  describe("GET /schema", () => {
    it("returns empty schema", async () => {
      const app = driverApi({ driver: baseDriver });
      const request = supertest(app);
      const response = await request.get("/schema");
      expect(response.body).to.deep.equal({
        tables: [],
      });
    });

    it("returns given schema", async () => {
      const schema = {
        tables: [{ name: "foobar" }],
      };
      const app = driverApi({ driver: baseDriver, schema });
      const request = supertest(app);
      const response = await request.get("/schema");
      expect(response.body).to.deep.equal(schema);
    });

    it('loads schema from driver.getSchema if schema: "auto"', async () => {
      const schema = {
        tables: [
          {
            name: "automatic",
            columns: [],
          },
        ],
      };
      const app = driverApi({
        driver: {
          ...baseDriver,
          getSchema: async () => schema,
        },
        schema: "auto",
      });
      const request = supertest(app);
      const response = await request.get("/schema");
      expect(response.body).to.deep.equal(schema);
    });
  });

  describe("GET /config-notice", () => {
    it("returns .suggestedFreshSchema if tables is not an array", async () => {
      const schema = {
        tables: [
          {
            name: "automatic",
            columns: [],
          },
        ],
      };

      const app1 = driverApi({
        driver: {
          ...baseDriver,
          getSchema: async () => schema,
        },
      });
      const request1 = supertest(app1);
      const response1 = await request1.get("/config-notice");
      expect(response1.body).to.deep.equal({
        suggestedFreshSchema: schema,
      });

      const app2 = driverApi({
        driver: {
          ...baseDriver,
          getSchema: async () => schema,
        },
        schema: {
          tables: "test",
        },
      });
      const request2 = supertest(app2);
      const response2 = await request2.get("/config-notice");
      expect(response2.body).to.deep.equal({
        suggestedFreshSchema: schema,
      });
    });

    it("returns null if schema is given", async () => {
      const app = driverApi({
        driver: baseDriver,
        schema: {
          tables: [
            {
              name: "foobar",
              columns: [],
            },
          ],
        },
      });
      const request = supertest(app);
      const response = await request.get("/config-notice");
      expect(response.body).to.equal(null);
    });
  });
});
