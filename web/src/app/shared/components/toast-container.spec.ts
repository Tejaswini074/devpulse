import { TestBed } from "@angular/core/testing";
import { ToastContainer } from "./toast-container";
import { ToastService } from "../../core/services/toast.service";

describe("ToastContainer", () => {
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ToastContainer] }).compileComponents();
    toastService = TestBed.inject(ToastService);
  });

  it("renders one entry per toast in the service", () => {
    const fixture = TestBed.createComponent(ToastContainer);
    toastService.success("Saved successfully");
    toastService.error("Something went wrong");
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain("Saved successfully");
    expect(text).toContain("Something went wrong");
  });

  it("dismissing a toast removes it from the DOM", () => {
    const fixture = TestBed.createComponent(ToastContainer);
    toastService.info("Heads up");
    fixture.detectChanges();
    const id = toastService.toasts()[0].id;

    toastService.dismiss(id);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain("Heads up");
  });

  it("maps each toast kind to its class and icon", () => {
    const fixture = TestBed.createComponent(ToastContainer);
    const component = fixture.componentInstance;

    expect(component.iconName("success")).toBe("check-square");
    expect(component.iconName("error")).toBe("x");
    expect(component.iconClass("error")).toContain("red");
    expect(component.kindClass("info")).toContain("slate");
  });
});
