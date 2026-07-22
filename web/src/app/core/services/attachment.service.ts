import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api.model";
import { Attachment, AttachmentModuleName } from "../models/attachment.model";

@Injectable({ providedIn: "root" })
export class AttachmentService {
  private readonly baseUrl = `${environment.apiUrl}/attachments`;

  constructor(private http: HttpClient) {}

  listByRecord(moduleName: AttachmentModuleName, recordId: number): Observable<ApiResponse<Attachment[]>> {
    return this.http.get<ApiResponse<Attachment[]>>(`${this.baseUrl}/${moduleName}/${recordId}`);
  }

  upload(moduleName: AttachmentModuleName, recordId: number, file: File): Observable<ApiResponse<{ id: number }>> {
    const formData = new FormData();
    formData.append("file", file);
    return this.http.post<ApiResponse<{ id: number }>>(`${this.baseUrl}/${moduleName}/${recordId}`, formData);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, { responseType: "blob" });
  }

  remove(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
