import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { SocketService } from './core/services/socket.service';
import { ToastContainer } from './shared/components/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private theme = inject(ThemeService);
  private auth = inject(AuthService);
  private socket = inject(SocketService);
  protected readonly title = signal('devpulse-web');

  constructor() {
    const token = this.auth.getAccessToken();
    if (this.auth.isLoggedIn() && token) {
      this.socket.connect(token);
    }
  }
}
