import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { ApiResponse } from "../models/api.model";
import { TaskComment } from "../models/comment.model";

@Injectable({ providedIn: "root" })
export class CommentService {
  private readonly baseUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  listByTask(taskId: number): Observable<ApiResponse<TaskComment[]>> {
    return this.http.get<ApiResponse<TaskComment[]>>(`${this.baseUrl}/task/${taskId}`);
  }

  create(taskId: number, comment: string, parentCommentId?: number): Observable<ApiResponse<{ id: number }>> {
    return this.http.post<ApiResponse<{ id: number }>>(`${this.baseUrl}/task/${taskId}`, {
      comment,
      parent_comment_id: parentCommentId
    });
  }

  update(id: number, comment: string): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(`${this.baseUrl}/${id}`, { comment });
  }

  remove(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
