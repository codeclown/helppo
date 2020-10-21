import { expect } from "chai";
import niceifyName from "./niceifyName";

describe("niceifyName", () => {
  it("niceifies names", () => {
    expect(niceifyName("teams")).to.equal("Teams");
    expect(niceifyName("id")).to.equal("ID");
    expect(niceifyName("created_at")).to.equal("Created At");
    expect(niceifyName("createdAt")).to.equal("Created At");
    expect(niceifyName("team_id")).to.equal("Team ID");
    expect(niceifyName("teamId")).to.equal("Team ID");
    expect(niceifyName("teamID")).to.equal("Team ID");
    expect(niceifyName("date_utc")).to.equal("Date UTC");
    expect(niceifyName("wp_posts")).to.equal("WP Posts");
    expect(niceifyName("posted_at_gmt")).to.equal("Posted At GMT");
  });
});
