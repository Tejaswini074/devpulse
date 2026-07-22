import { TestBed } from "@angular/core/testing";
import { Tabs, TabItem } from "./tabs";

describe("Tabs", () => {
  const tabs: TabItem[] = [
    { id: "overview", label: "Overview" },
    { id: "comments", label: "Comments", badge: 3 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Tabs] }).compileComponents();
  });

  it("renders a button per tab with its label and badge", () => {
    const fixture = TestBed.createComponent(Tabs);
    fixture.componentInstance.tabs = tabs;
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll("button"));
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain("Overview");
    expect(buttons[1].textContent).toContain("Comments");
    expect(buttons[1].textContent).toContain("3");
  });

  it("emits activeChange with the clicked tab's id", () => {
    const fixture = TestBed.createComponent(Tabs);
    fixture.componentInstance.tabs = tabs;
    fixture.detectChanges();
    const emitSpy = spyOn(fixture.componentInstance.activeChange, "emit");

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll("button"));
    buttons[1].click();

    expect(emitSpy).toHaveBeenCalledWith("comments");
  });
});
