import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { Router, provideRouter } from "@angular/router";
import { environment } from "../../../environments/environment";
import { Login } from "./login";

describe("Login", () => {
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it("marks the form invalid and does not call the API when fields are empty", () => {
    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;

    component.submit();

    expect(component.form.invalid).toBe(true);
    httpMock.expectNone(`${environment.apiUrl}/auth/login`);
  });

  it("submits valid credentials, then navigates to /dashboard on success", () => {
    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;
    const navigateSpy = spyOn(router, "navigate");

    component.form.setValue({ email: "rahul@devpulse.com", password: "Admin@123" });
    component.submit();

    expect(component.loading()).toBe(true);

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({
      success: true,
      message: "ok",
      data: {
        accessToken: "tok",
        refreshToken: "refresh",
        user: { id: 1, name: "Rahul", email: "rahul@devpulse.com", role: "Manager", organization_id: 2, team_id: 2 }
      }
    });

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe("");
    expect(navigateSpy).toHaveBeenCalledWith(["/dashboard"]);
  });

  it("shows the server's error message and stays on the page when login fails", () => {
    const fixture = TestBed.createComponent(Login);
    const component = fixture.componentInstance;
    const navigateSpy = spyOn(router, "navigate");

    component.form.setValue({ email: "rahul@devpulse.com", password: "wrong" });
    component.submit();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ success: false, message: "Invalid email or password" }, { status: 401, statusText: "Unauthorized" });

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe("Invalid email or password");
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
