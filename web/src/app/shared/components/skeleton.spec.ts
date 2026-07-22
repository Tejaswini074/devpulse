import { TestBed } from "@angular/core/testing";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Skeleton] }).compileComponents();
  });

  it("renders 3 placeholder rows by default", () => {
    const fixture = TestBed.createComponent(Skeleton);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll(".animate-pulse > div").length).toBe(3);
  });

  it("renders the given number of rows", () => {
    const fixture = TestBed.createComponent(Skeleton);
    fixture.componentInstance.rows = 5;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll(".animate-pulse > div").length).toBe(5);
  });

  it("shrinks the last row's width to suggest a ragged line", () => {
    const fixture = TestBed.createComponent(Skeleton);
    fixture.componentInstance.rows = 2;
    fixture.detectChanges();

    const rows: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll(".animate-pulse > div"));
    expect(rows[0].style.width).toBe("100%");
    expect(rows[1].style.width).toBe("70%");
  });
});
