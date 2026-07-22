import { TestBed } from "@angular/core/testing";
import { Modal } from "./modal";

describe("Modal", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Modal] }).compileComponents();
  });

  it("renders nothing when closed", () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentInstance.open = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".fixed")).toBeNull();
  });

  it("renders the title when open", () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentInstance.open = true;
    fixture.componentInstance.title = "Edit task";
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Edit task");
  });

  it("emits close when the backdrop is clicked directly", () => {
    const fixture = TestBed.createComponent(Modal);
    const component = fixture.componentInstance;
    component.open = true;
    fixture.detectChanges();
    const closeSpy = spyOn(component.close, "emit");

    const backdrop: HTMLElement = fixture.nativeElement.querySelector(".fixed");
    backdrop.dispatchEvent(new MouseEvent("click"));
    Object.defineProperty(backdrop, "currentTarget", { value: backdrop });

    component.onBackdropClick({ target: backdrop, currentTarget: backdrop } as unknown as MouseEvent);

    expect(closeSpy).toHaveBeenCalled();
  });

  it("does not emit close when clicking inside the panel", () => {
    const fixture = TestBed.createComponent(Modal);
    const component = fixture.componentInstance;
    component.open = true;
    fixture.detectChanges();
    const closeSpy = spyOn(component.close, "emit");

    component.onBackdropClick({ target: {}, currentTarget: {} } as unknown as MouseEvent);

    expect(closeSpy).not.toHaveBeenCalled();
  });

  it("emits close on Escape only while open", () => {
    const fixture = TestBed.createComponent(Modal);
    const component = fixture.componentInstance;
    const closeSpy = spyOn(component.close, "emit");

    component.open = false;
    component.onEscape();
    expect(closeSpy).not.toHaveBeenCalled();

    component.open = true;
    component.onEscape();
    expect(closeSpy).toHaveBeenCalled();
  });

  it("maps the size input to the right max-width class", () => {
    const fixture = TestBed.createComponent(Modal);
    const component = fixture.componentInstance;

    component.size = "sm";
    expect(component.sizeClass).toBe("max-w-md");
    component.size = "lg";
    expect(component.sizeClass).toBe("max-w-2xl");
  });
});
