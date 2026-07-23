import { TestBed } from "@angular/core/testing";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Pagination] }).compileComponents();
  });

  it("renders nothing when there is only one page", () => {
    const fixture = TestBed.createComponent(Pagination);
    fixture.componentInstance.page = 1;
    fixture.componentInstance.totalPages = 1;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe("");
  });

  it("shows the current page, total pages, and total count", () => {
    const fixture = TestBed.createComponent(Pagination);
    fixture.componentInstance.page = 2;
    fixture.componentInstance.totalPages = 5;
    fixture.componentInstance.total = 97;
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain("Page 2 of 5");
    expect(fixture.nativeElement.textContent).toContain("97 total");
  });

  it("disables Prev on the first page and Next on the last page", () => {
    const fixture = TestBed.createComponent(Pagination);
    fixture.componentInstance.page = 1;
    fixture.componentInstance.totalPages = 3;
    fixture.detectChanges();

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll("button"));
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(false);

    fixture.componentInstance.page = 3;
    fixture.detectChanges();
    const buttonsAtEnd: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll("button"));
    expect(buttonsAtEnd[0].disabled).toBe(false);
    expect(buttonsAtEnd[1].disabled).toBe(true);
  });

  it("emits pageChange with the adjacent page number", () => {
    const fixture = TestBed.createComponent(Pagination);
    fixture.componentInstance.page = 2;
    fixture.componentInstance.totalPages = 3;
    fixture.detectChanges();
    const emitSpy = spyOn(fixture.componentInstance.pageChange, "emit");

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll("button"));
    buttons[0].click();
    expect(emitSpy).toHaveBeenCalledWith(1);
    buttons[1].click();
    expect(emitSpy).toHaveBeenCalledWith(3);
  });
});
