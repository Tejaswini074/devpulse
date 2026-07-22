import { TestBed } from "@angular/core/testing";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EmptyState] }).compileComponents();
  });

  it("renders the title and default icon", () => {
    const fixture = TestBed.createComponent(EmptyState);
    fixture.componentInstance.title = "No tasks yet";
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("No tasks yet");
  });

  it("only renders the subtitle when provided", () => {
    const fixture = TestBed.createComponent(EmptyState);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll("p").length).toBe(1);

    fixture.componentInstance.subtitle = "Create your first task to get started";
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Create your first task to get started");
  });

  it("only renders the action button when actionLabel is set, and emits action on click", () => {
    const fixture = TestBed.createComponent(EmptyState);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("button")).toBeNull();

    fixture.componentInstance.actionLabel = "Create task";
    fixture.detectChanges();
    const actionSpy = spyOn(fixture.componentInstance.action, "emit");

    const button: HTMLButtonElement = fixture.nativeElement.querySelector("button");
    expect(button.textContent).toContain("Create task");
    button.click();

    expect(actionSpy).toHaveBeenCalled();
  });
});
