import { expect } from "chai";
import { formatDate, formatTime } from "./dateFormatting";

describe("dateFormatting", () => {
  describe(".formatDate", () => {
    it("formats date", () => {
      expect(formatDate(new Date("1995-12-17T03:24:00"))).to.equal(
        "1995-12-17"
      );
    });
  });

  describe(".formatTime", () => {
    it("formats time", () => {
      expect(formatTime(new Date("1995-12-17T03:24:00"))).to.equal("03:24:00");
    });
  });
});
