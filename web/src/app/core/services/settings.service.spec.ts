import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { environment } from "../../../environments/environment";
import { SettingsService } from "./settings.service";

describe("SettingsService", () => {
  let service: SettingsService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/settings`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it("getAll() GETs the org's settings map", () => {
    service.getAll().subscribe();
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe("GET");
    req.flush({ success: true, message: "ok", data: { company_name: "Acme" } });
  });

  it("update() PUTs the settings payload", () => {
    service.update({ weekly_hours_target: "35" }).subscribe();
    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe("PUT");
    expect(req.request.body).toEqual({ weekly_hours_target: "35" });
    req.flush({ success: true, message: "ok", data: { weekly_hours_target: "35" } });
  });
});
