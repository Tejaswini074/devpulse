import { Injectable } from "@angular/core";
import { Socket, io } from "socket.io-client";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class SocketService {
  private socket: Socket | null = null;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }
    this.socket = io(environment.apiUrl.replace(/\/api\/?$/, ""), {
      auth: { token },
      transports: ["websocket", "polling"]
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  on<T>(event: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      if (!this.socket) {
        return;
      }
      const handler = (payload: T) => subscriber.next(payload);
      this.socket.on(event, handler);
      return () => this.socket?.off(event, handler);
    });
  }
}
